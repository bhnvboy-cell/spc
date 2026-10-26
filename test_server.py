"""Full test suite for SPC Trainer auth server."""
import urllib.request
import urllib.error
import json
import http.cookiejar
import sqlite3
import os

BASE = "http://localhost:8765"
PASS = "mef" + "sco123"
results = []

# Clear prior lockout attempts so rate-limit state doesn't leak across runs
_db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "spc_users.db")
try:
    _c = sqlite3.connect(_db_path)
    _c.execute("DELETE FROM login_attempts")
    _c.commit()
    _c.close()
except Exception:
    pass


def check(name, cond, detail=""):
    results.append(("PASS" if cond else "FAIL", name, str(detail)))
    print(("PASS" if cond else "FAIL"), name, detail, flush=True)


def req(method, path, data=None, headers=None, jar=None):
    if jar is None:
        jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(jar)
    )
    h = {"Content-Type": "application/json"}
    if headers:
        h.update(headers)
    body = json.dumps(data).encode() if data is not None else None
    r = urllib.request.Request(BASE + path, data=body, headers=h, method=method)
    try:
        resp = opener.open(r, timeout=10)
        return resp.status, resp.read().decode(), resp.headers
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode(), e.headers


# --- user flow ---
jar = http.cookiejar.CookieJar()
st, body, _ = req("POST", "/api/login", {"username": "user1", "password": PASS},
                  {"X-Requested-With": "XMLHttpRequest"}, jar)
check("user1 login", st == 200 and json.loads(body).get("ok"), body)

st, body, _ = req("GET", "/api/me", None, None, jar)
check("user1 me", st == 200 and json.loads(body).get("username") == "user1", body)

st, body, _ = req("GET", "/", None, None, jar)
check("user1 index", st == 200 and len(body) > 10000, f"len={len(body)}")

st, body, _ = req("GET", "/admin", None, None, jar)
check("user1 admin denied", st == 403, st)

st, body, _ = req("GET", "/api/admin/users", None, None, jar)
check("user1 admin API denied", st == 403, st)

st, body, _ = req("POST", "/api/logout", {}, {"X-Requested-With": "XMLHttpRequest"}, jar)
check("user1 logout", st == 200, body)

st, body, _ = req("GET", "/api/me", None, None, jar)
check("me after logout 401", st == 401, st)

st, body, _ = req("GET", "/api/me", None, None, None)
check("me no cookie 401", st == 401, st)

st, body, _ = req("POST", "/api/login", {"username": "user2", "password": "bad"},
                  {"X-Requested-With": "XMLHttpRequest"}, None)
check("wrong password 401", st == 401, st)

# CSRF
jar2 = http.cookiejar.CookieJar()
st, body, _ = req("POST", "/api/login", {"username": "user4", "password": PASS},
                  {"X-Requested-With": "XMLHttpRequest"}, jar2)
check("user4 login", st == 200, body)
st, body, _ = req("POST", "/api/logout", {}, {}, jar2)
check("CSRF missing 403", st == 403, st)

# --- admin flow ---
jarA = http.cookiejar.CookieJar()
st, body, _ = req("POST", "/api/login", {"username": "admin", "password": PASS},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin login", st == 200 and json.loads(body).get("role") == "admin", body)

st, body, _ = req("GET", "/api/admin/users", None, None, jarA)
users = json.loads(body).get("users", [])
check("admin list 31 users", len(users) == 31, f"count={len(users)}")

st, body, _ = req("GET", "/admin", None, None, jarA)
check("admin page", st == 200 and len(body) > 1000, f"len={len(body)}")

st, body, _ = req("POST", "/api/admin/users/user10/password", {"password": "NewPass999"},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin reset user10", st == 200 and json.loads(body).get("ok"), body)

jar10 = http.cookiejar.CookieJar()
st, body, _ = req("POST", "/api/login", {"username": "user10", "password": "NewPass999"},
                  {"X-Requested-With": "XMLHttpRequest"}, jar10)
check("user10 new pw login", st == 200, body)

st, body, _ = req("POST", "/api/change-password",
                  {"current": "NewPass999", "new": "Changed456"},
                  {"X-Requested-With": "XMLHttpRequest"}, jar10)
check("user10 change own pw", st == 200 and json.loads(body).get("ok"), body)

st, body, _ = req("POST", "/api/admin/users/user7/toggle", {},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin disable user7", st == 200 and json.loads(body).get("enabled") is False, body)

st, body, _ = req("POST", "/api/login", {"username": "user7", "password": PASS},
                  {"X-Requested-With": "XMLHttpRequest"}, None)
check("disabled login 401", st == 401, st)

st, body, _ = req("POST", "/api/admin/users/user7/toggle", {},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin re-enable user7", st == 200 and json.loads(body).get("enabled") is True, body)

st, body, _ = req("POST", "/api/admin/users/user10/sessions", {},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin kick user10", st == 200, body)

st, body, _ = req("GET", "/api/me", None, None, jar10)
check("user10 kicked 401", st == 401, st)

st, body, _ = req("GET", "/%2e%2e/server.py", None, None, jarA)
check("path traversal blocked", st in (403, 404), f"{st} len={len(body)}")

st, body, _ = req("GET", "/..%2fserver.py", None, None, jarA)
check("path traversal2 blocked", st in (403, 404), f"{st} len={len(body)}")

st, body, _ = req("POST", "/api/admin/users/admin/toggle", {},
                  {"X-Requested-With": "XMLHttpRequest"}, jarA)
check("admin cannot disable self", st == 400, st)

st, body, _ = req("GET", "/js/app.js", None, None, jarA)
check("authed app.js", st == 200 and len(body) > 10000, f"len={len(body)}")

st, body, _ = req("GET", "/css/styles.css", None, None, jarA)
check("authed styles.css", st == 200 and len(body) > 1000, f"len={len(body)}")

st, body, _ = req("GET", "/login", None, None, None)
check("login page", st == 200 and len(body) > 1000, f"len={len(body)}")

# unauthenticated / redirects (no cookie jar at all)
req_nojar = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
try:
    resp = req_nojar.open(BASE + "/", timeout=5)
    final_url = resp.geturl()
    check("unauth / lands on login", final_url.endswith("/login"), final_url)
except Exception as e:
    check("unauth / lands on login", False, str(e))

# lockout test: 5 bad attempts then 429 (fake username so real accounts stay safe)
for i in range(5):
    st, body, _ = req("POST", "/api/login", {"username": "locktest_user", "password": "wrongpass"},
                      {"X-Requested-With": "XMLHttpRequest"}, None)
st, body, _ = req("POST", "/api/login", {"username": "locktest_user", "password": PASS},
                  {"X-Requested-With": "XMLHttpRequest"}, None)
check("lockout after 5 attempts 429", st == 429, f"{st} {body}")

# restore user10 password
req("POST", "/api/admin/users/user10/password", {"password": PASS},
    {"X-Requested-With": "XMLHttpRequest"}, jarA)

for s, n, d in results:
    print(f"{s}  {n}  {d}")
fails = sum(1 for x in results if x[0] == "FAIL")
passes = sum(1 for x in results if x[0] == "PASS")
print(f"\n==== {passes} passed, {fails} failed ====")
raise SystemExit(1 if fails else 0)
