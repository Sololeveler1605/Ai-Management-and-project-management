"""
llm_client.py
Thin wrapper around an OpenAI-compatible chat completion API.
Falls back to a deterministic local summary when no API key is configured,
so meeting/report flows still work in local development.
"""

from __future__ import annotations

import json
import os
import urllib.error
import urllib.request


def call_llm(prompt: str) -> str:
    api_key = (
        os.getenv("OPENAI_API_KEY")
        or os.getenv("LLM_API_KEY")
        or ""
    ).strip()
    base_url = (
        os.getenv("OPENAI_BASE_URL")
        or os.getenv("LLM_BASE_URL")
        or "https://api.openai.com/v1"
    ).rstrip("/")
    model = os.getenv("OPENAI_MODEL") or os.getenv("LLM_MODEL") or "gpt-4o-mini"

    if not api_key:
        return _fallback_response(prompt)

    payload = {
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful project assistant. Follow the user instructions exactly.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        f"{base_url}/chat/completions",
        data=data,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            body = json.loads(response.read().decode("utf-8"))
        return body["choices"][0]["message"]["content"]
    except (urllib.error.URLError, KeyError, IndexError, json.JSONDecodeError, TimeoutError) as exc:
        return _fallback_response(prompt, error=str(exc))


def _fallback_response(prompt: str, error: str | None = None) -> str:
    """Produce valid meeting-summary JSON when the LLM is unavailable."""
    note = " (LLM unavailable)" if error or "OPENAI" not in os.environ else ""
    transcript_hint = ""
    marker = "Transcript:"
    if marker in prompt:
        transcript_hint = prompt.split(marker, 1)[-1].strip()[:400]

    summary = (
        f"Automated meeting summary{note}. "
        f"Key discussion points were extracted from the available transcript."
    )
    if transcript_hint:
        summary += f" Excerpt: {transcript_hint[:180]}..."

    return json.dumps(
        {
            "summary": summary,
            "action_items": [
                "Review meeting notes with the project team",
                "Confirm owners for open discussion items",
            ],
            "risks": [
                "LLM API was not configured or failed - summary is approximate",
            ],
            "deadlines": [],
        }
    )
