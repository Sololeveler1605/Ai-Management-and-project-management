import json
from pathlib import Path

base = Path(r"C:\Users\Piyush\.grok\sessions\d%3A%5Cafforable%20ai%5CAI_project%20os")
out_dir = Path(r"d:\afforable ai\AI_project os")

sessions = {
    "rag": "019fbc95-b299-7d60-9d9f-75214b2d1909",
    "continue": "019fbc9e-011d-77d2-805e-21856048fe03",
    "alembic": "019fbc55-c91c-7460-9c84-238cea4ea35d",
}

for name, sid in sessions.items():
    p = base / sid / "updates.jsonl"
    texts = []
    if not p.exists():
        continue
    for line in p.open(encoding="utf-8"):
        try:
            o = json.loads(line)
        except Exception:
            continue
        u = o.get("params", {}).get("update", {})
        su = u.get("sessionUpdate")
        if su in ("agent_message_chunk", "user_message_chunk"):
            t = (u.get("content") or {}).get("text") or ""
            if t:
                prefix = "\n===USER===\n" if su.startswith("user") else ""
                texts.append(prefix + t)
    full = "".join(texts)
    out = out_dir / f"_extract_{name}.txt"
    # Keep last portion which usually has conclusions
    out.write_text(full[-20000:] if len(full) > 20000 else full, encoding="utf-8")
    print(f"{name}: {len(full)} chars -> {out.name}")

# Also extract todos / final thoughts from events
p = base / "019fbc95-b299-7d60-9d9f-75214b2d1909" / "events.jsonl"
if p.exists():
    lines = p.read_text(encoding="utf-8").splitlines()
    (out_dir / "_extract_rag_events_tail.txt").write_text(
        "\n".join(lines[-30:]), encoding="utf-8"
    )
    print("events tail written")
