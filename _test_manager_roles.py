"""Temporary connection/role test for manager flows."""
import sys
import traceback

import requests

sys.path.insert(0, r"d:\afforable ai\AI_project os\backend")

print("1. import backend modules...", flush=True)
from database import SessionLocal, engine
from security import create_access_token
import models

BASE = "http://127.0.0.1:8000"

print("2. health check...", flush=True)
r = requests.get(BASE + "/", timeout=10)
print("   ", r.status_code, r.json(), flush=True)

print("3. load users from DB...", flush=True)
db = SessionLocal()
try:
    all_users = db.query(models.User).all()
    print(f"   loaded {len(all_users)} users", flush=True)
    users_by_role = {}
    for u in all_users:
        users_by_role.setdefault(u.role, u)
finally:
    db.close()

tokens = {}
for role in ("admin", "manager", "employee", "client"):
    u = users_by_role[role]
    tokens[role] = create_access_token(
        {
            "sub": str(u.id),
            "role": u.role,
            "organization_id": str(u.organization_id),
        }
    )
    print(f"   token ok for {role}: {u.email}", flush=True)

checks = [
    ("GET", "/users"),
    ("GET", "/clients"),
    ("GET", "/projects"),
    ("GET", "/tasks"),
    ("GET", "/documents"),
    ("GET", "/client-dashboard"),
]

print("\n=== ROLE ACCESS MATRIX ===", flush=True)
for role, token in tokens.items():
    h = {"Authorization": f"Bearer {token}"}
    row = [role]
    for method, path in checks:
        try:
            resp = requests.request(method, BASE + path, headers=h, timeout=15)
            row.append(f"{path}={resp.status_code}")
        except Exception as exc:
            row.append(f"{path}=ERR:{exc}")
    print(" | ".join(row), flush=True)

print("\n=== MANAGER DEEP CHECKS ===", flush=True)
h = {"Authorization": f"Bearer {tokens['manager']}"}

try:
    r = requests.get(BASE + "/projects", headers=h, timeout=15)
    projects = r.json() if r.ok else []
    print("projects", r.status_code, "count=", len(projects) if r.ok else r.text[:150], flush=True)

    r = requests.get(BASE + "/users", headers=h, timeout=15)
    users_list = r.json() if r.ok else []
    print("users", r.status_code, "count=", len(users_list) if r.ok else r.text[:150], flush=True)

    r = requests.get(BASE + "/clients", headers=h, timeout=15)
    clients = r.json() if r.ok else []
    print("clients GET", r.status_code, "count=", len(clients) if r.ok else r.text[:150], flush=True)

    r = requests.post(
        BASE + "/clients",
        headers=h,
        json={"company_name": "X", "contact_name": "Y"},
        timeout=15,
    )
    print("clients POST expect403", r.status_code, r.text[:150], flush=True)

    if clients:
        cid = clients[0]["id"]
        r = requests.put(BASE + f"/clients/{cid}", headers=h, json={"company_name": "Nope"}, timeout=15)
        print("clients PUT expect403", r.status_code, r.text[:150], flush=True)
        r = requests.delete(BASE + f"/clients/{cid}", headers=h, timeout=15)
        print("clients DELETE expect403", r.status_code, r.text[:150], flush=True)

    bad = {
        "name": "Bad Project",
        "status": "active",
        "deadline": None,
        "manager_ids": [],
        "employee_ids": [],
    }
    r = requests.post(BASE + "/projects", headers=h, json=bad, timeout=15)
    print("create BAD payload (manager.py)", r.status_code, r.text[:220], flush=True)

    managers = [u for u in users_list if u["role"] == "manager"]
    employees = [u for u in users_list if u["role"] == "employee"]
    new_proj = None
    if clients:
        good = {
            "client_id": clients[0]["id"],
            "name": "Mgr Test Project",
            "description": "connection test",
            "budget": 1000,
            "deadline": "2026-12-31",
            "status": "active",
            "team_user_ids": [employees[0]["id"]] if employees else [],
        }
        r = requests.post(BASE + "/projects", headers=h, json=good, timeout=15)
        print("create GOOD payload", r.status_code, r.text[:220], flush=True)
        if r.ok:
            new_proj = r.json()

    pid = (new_proj or (projects[0] if projects else {})).get("id")
    if pid:
        r = requests.get(BASE + f"/projects/{pid}/team", headers=h, timeout=15)
        print("get team", r.status_code, "n=", len(r.json()) if r.ok else r.text[:120], flush=True)

        r = requests.put(
            BASE + f"/projects/{pid}/team",
            headers=h,
            json={"team_user_ids": [employees[0]["id"]] if employees else []},
            timeout=15,
        )
        print("assign WRONG team_user_ids", r.status_code, r.text[:200], flush=True)

        team_ids = []
        if managers:
            team_ids.append(managers[0]["id"])
        if employees:
            team_ids.append(employees[0]["id"])
        r = requests.put(
            BASE + f"/projects/{pid}/team",
            headers=h,
            json={"user_ids": team_ids},
            timeout=15,
        )
        print("assign CORRECT user_ids", r.status_code, r.text[:200], flush=True)

        r = requests.patch(BASE + f"/projects/{pid}", headers=h, json={"status": "at_risk"}, timeout=15)
        print("patch at_risk invalid", r.status_code, r.text[:180], flush=True)

        r = requests.patch(BASE + f"/projects/{pid}", headers=h, json={"status": "active"}, timeout=15)
        print("patch active valid", r.status_code, flush=True)

    r = requests.post(BASE + "/tasks", headers=h, json={"title": "t", "status": "review"}, timeout=15)
    print("task status=review invalid", r.status_code, r.text[:180], flush=True)

    print("\nDONE", flush=True)
except Exception:
    traceback.print_exc()
finally:
    engine.dispose()
