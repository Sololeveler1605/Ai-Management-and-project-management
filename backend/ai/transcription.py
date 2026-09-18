"""
transcription.py
Turn an audio file path into a transcript string using openai-whisper.

The Whisper model is held in a module-level singleton and loaded ONCE on
first use (never per request). Size comes from WHISPER_MODEL_SIZE (default:
"base") — do not bump to a larger model without an explicit decision.

Whisper shells out to `ffmpeg` for most formats. On Windows that often
fails with WinError 2 when ffmpeg is not installed. We resolve a bundled
ffmpeg via imageio-ffmpeg and patch Whisper to use it.
"""

from __future__ import annotations

import os
import shutil
import wave
from functools import lru_cache
from pathlib import Path

import numpy as np

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "base")

# Module-level singleton — populated once, reused for every transcription.
_WHISPER_MODEL = None
_FFMPEG_PATCHED = False


@lru_cache(maxsize=1)
def _resolve_ffmpeg_exe() -> str | None:
    """Prefer system ffmpeg; otherwise use the imageio-ffmpeg bundled binary."""
    which = shutil.which("ffmpeg")
    if which:
        return which
    try:
        import imageio_ffmpeg

        exe = imageio_ffmpeg.get_ffmpeg_exe()
        if exe and Path(exe).exists():
            # Put it on PATH so any subprocess looking for "ffmpeg" finds it.
            ffmpeg_dir = str(Path(exe).parent)
            os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")
            return exe
    except Exception:
        return None
    return None


def _ensure_whisper_ffmpeg() -> None:
    """Make openai-whisper use a real ffmpeg path instead of bare 'ffmpeg'."""
    global _FFMPEG_PATCHED
    if _FFMPEG_PATCHED:
        return

    ffmpeg_exe = _resolve_ffmpeg_exe()
    if not ffmpeg_exe:
        _FFMPEG_PATCHED = True
        return

    import whisper.audio as whisper_audio

    original_run = whisper_audio.run

    def _run(cmd, *args, **kwargs):
        if isinstance(cmd, (list, tuple)) and cmd and cmd[0] == "ffmpeg":
            cmd = [ffmpeg_exe, *list(cmd)[1:]]
        return original_run(cmd, *args, **kwargs)

    whisper_audio.run = _run  # type: ignore[method-assign]
    _FFMPEG_PATCHED = True


def _get_whisper_model():
    global _WHISPER_MODEL
    if _WHISPER_MODEL is None:
        import whisper

        _ensure_whisper_ffmpeg()
        _WHISPER_MODEL = whisper.load_model(WHISPER_MODEL_SIZE)
    return _WHISPER_MODEL


def _load_wav_mono_16k(path: Path) -> np.ndarray:
    """Load a PCM .wav without ffmpeg (Whisper expects float32 mono @ 16 kHz)."""
    with wave.open(str(path), "rb") as handle:
        channels = handle.getnchannels()
        sample_width = handle.getsampwidth()
        sample_rate = handle.getframerate()
        frames = handle.readframes(handle.getnframes())

    if sample_width == 2:
        audio = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
    elif sample_width == 4:
        audio = np.frombuffer(frames, dtype=np.int32).astype(np.float32) / 2147483648.0
    else:
        raise RuntimeError(f"Unsupported WAV sample width: {sample_width}")

    if channels > 1:
        audio = audio.reshape(-1, channels).mean(axis=1)

    if sample_rate != 16000:
        duration = len(audio) / float(sample_rate)
        target_len = max(1, int(duration * 16000))
        audio = np.interp(
            np.linspace(0, len(audio), target_len, endpoint=False),
            np.arange(len(audio)),
            audio,
        ).astype(np.float32)

    return audio


def transcribe_audio(file_path: str) -> str:
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {file_path}")

    # Plain-text uploads are useful for local/dev without a real recording.
    suffix = path.suffix.lower()
    if suffix in {".txt", ".md", ".csv"}:
        return path.read_text(encoding="utf-8", errors="replace")

    model = _get_whisper_model()

    try:
        if suffix == ".wav":
            try:
                audio = _load_wav_mono_16k(path)
                result = model.transcribe(audio)
            except Exception:
                # Non-PCM / odd WAVs: fall back to ffmpeg decode.
                _ensure_whisper_ffmpeg()
                if not _resolve_ffmpeg_exe():
                    raise
                result = model.transcribe(str(path))
        else:
            _ensure_whisper_ffmpeg()
            if not _resolve_ffmpeg_exe():
                raise RuntimeError(
                    "ffmpeg is required for this audio type but was not found. "
                    "Install imageio-ffmpeg (pip install imageio-ffmpeg) or add "
                    "ffmpeg to PATH. For a quick test, upload a PCM .wav or .txt file."
                )
            result = model.transcribe(str(path))
    except FileNotFoundError as exc:
        # WinError 2 / missing ffmpeg usually surfaces as FileNotFoundError.
        raise RuntimeError(
            "Audio decoding failed because ffmpeg was not found "
            f"({exc}). Install imageio-ffmpeg or system ffmpeg, then restart the API."
        ) from exc

    text = (result.get("text") or "").strip()
    if not text:
        raise RuntimeError("Whisper returned an empty transcript")
    return text
