#!/usr/bin/env python3
"""SPC Trainer — production authentication server (stdlib only).

Serves the static app behind login. Admin + user1..user30.
Zero third-party dependencies. Threaded for ~30 concurrent users.
"""
from __future__ import annotations

import contextlib
import hashlib
import hmac
import json
import logging
import os
import secrets
import sqlite3
import threading
import time
import urllib.parse
from datetime import datetime, timezone
from http import HTTPStatus
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
HOST = "0.0.0.0"
PORT = 8765
DB_PATH = os.path.join(BASE_DIR, "spc_users.db")

SESSION_HOURS = 12
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_SECONDS = 15 * 60
PBKDF2_ITERATIONS = 200_000
COOKIE_NAME = "spc_session"
COOKIE_PATH = "/"
DEFAULT_PASSWORD = "mef" + "sco123"  # mefsco123

ADMIN_USER = "admin"
USERS = [f"user{i}" for i in range(1, 31)]

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
log = logging.getLogger("spc")

# ---------------------------------------------------------------------------
# Database
# ---------------------------------------------------------------------------
_db_lock = threading.Lock()


def _utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, timeout=15, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=15000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextlib.contextmanager
def db():
    """Thread-safe short-lived DB session. Always closes the connection."""
    conn = _connect()
    try:
        with _db_lock:
            yield conn
            conn.commit()
    except Exception:
        try:
            conn.rollback()
        except Exception:
            pass
        raise
    finally:
        conn.close()


def hash_password(password: str, salt: str | None = None) -> tuple[str, str]:
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), salt.encode("utf-8"), PBKDF2_ITERATIONS
    )
    return dk.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    candidate, _ = hash_password(password, salt)
    return hmac.compare_digest(candidate, stored_hash)


def init_db() -> None:
    conn = _connect()
    try:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
                enabled INTEGER NOT NULL DEFAULT 1,
                created_at TEXT NOT NULL,
                last_login TEXT
            );
            CREATE TABLE IF NOT EXISTS sessions (
                token TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                ip TEXT,
                user_agent TEXT
            );
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL,
                ip TEXT NOT NULL,
                success INTEGER NOT NULL DEFAULT 0,
                ts REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS quiz_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                score INTEGER NOT NULL,
                total INTEGER NOT NULL,
                pct INTEGER NOT NULL,
                created_at TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
            CREATE INDEX IF NOT EXISTS idx_attempts_lookup ON login_attempts(username, ip, ts);
            CREATE INDEX IF NOT EXISTS idx_quiz_user ON quiz_scores(user_id);
            """
        )
        existing = {
            r["username"]
            for r in conn.execute("SELECT username FROM users").fetchall()
        }
        now = _utcnow()
        to_seed = []
        if ADMIN_USER not in existing:
            h, s = hash_password(DEFAULT_PASSWORD)
            to_seed.append((ADMIN_USER, h, s, "admin", 1, now))
        for u in USERS:
            if u not in existing:
                h, s = hash_password(DEFAULT_PASSWORD)
                to_seed.append((u, h, s, "user", 1, now))
        if to_seed:
            conn.executemany(
                "INSERT INTO users (username,password_hash,salt,role,enabled,created_at) "
                "VALUES (?,?,?,?,?,?)",
                to_seed,
            )
            log.info("Seeded %d accounts", len(to_seed))
        conn.commit()
    finally:
        conn.close()


def get_user_by_username(conn: sqlite3.Connection, username: str):
    return conn.execute(
        "SELECT * FROM users WHERE username = ?", (username,)
    ).fetchone()


def get_user_by_id(conn: sqlite3.Connection, user_id: int):
    return conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()


# ---------------------------------------------------------------------------
# Rate limiting / lockout
# ---------------------------------------------------------------------------
def is_locked_out(conn: sqlite3.Connection, username: str, ip: str) -> bool:
    cutoff = time.time() - LOCKOUT_SECONDS
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM login_attempts "
        "WHERE username = ? AND ip = ? AND success = 0 AND ts > ?",
        (username, ip, cutoff),
    ).fetchone()
    return row["n"] >= MAX_LOGIN_ATTEMPTS


def record_attempt(conn: sqlite3.Connection, username: str, ip: str, success: bool) -> None:
    conn.execute(
        "INSERT INTO login_attempts (username, ip, success, ts) VALUES (?,?,?,?)",
        (username, ip, 1 if success else 0, time.time()),
    )
    conn.execute("DELETE FROM login_attempts WHERE ts < ?", (time.time() - 86400,))


# ---------------------------------------------------------------------------
# Sessions
# ---------------------------------------------------------------------------
def create_session(conn: sqlite3.Connection, user_id: int, ip: str, ua: str) -> str:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_s = datetime.fromtimestamp(
        now.timestamp() + SESSION_HOURS * 3600, tz=timezone.utc
    ).strftime("%Y-%m-%dT%H:%M:%SZ")
    conn.execute(
        "INSERT INTO sessions (token,user_id,created_at,expires_at,ip,user_agent) "
        "VALUES (?,?,?,?,?,?)",
        (token, user_id, now.strftime("%Y-%m-%dT%H:%M:%SZ"), expires_s, ip, ua[:200]),
    )
    return token


def get_session_user(conn: sqlite3.Connection, token: str):
    if not token:
        return None
    row = conn.execute(
        "SELECT s.token, s.expires_at, u.* FROM sessions s "
        "JOIN users u ON u.id = s.user_id "
        "WHERE s.token = ? AND u.enabled = 1",
        (token,),
    ).fetchone()
    if not row:
        return None
    exp = datetime.strptime(row["expires_at"], "%Y-%m-%dT%H:%M:%SZ").replace(
        tzinfo=timezone.utc
    )
    if exp < datetime.now(timezone.utc):
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        return None
    return row


def destroy_session(conn: sqlite3.Connection, token: str) -> None:
    conn.execute("DELETE FROM sessions WHERE token = ?", (token,))


def destroy_user_sessions(conn: sqlite3.Connection, user_id: int) -> None:
    conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))


def cleanup_expired() -> None:
    with db() as conn:
        conn.execute("DELETE FROM sessions WHERE expires_at < ?", (_utcnow(),))


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
class ApiError(Exception):
    def __init__(self, status: int, message: str):
        self.status = status
        self.message = message
        super().__init__(message)


def client_ip(handler: BaseHTTPRequestHandler) -> str:
    return handler.client_address[0] if handler.client_address else "unknown"


class Handler(BaseHTTPRequestHandler):
    server_version = "SPCTrainer/2.0"
    protocol_version = "HTTP/1.1"

    def log_message(self, fmt, *args):
        log.info("%s %s", client_ip(self), fmt % args)

    def _security_headers(self, content_type: str, length: int) -> None:
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(length))
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "same-origin")
        self.send_header(
            "Content-Security-Policy",
            "default-src 'self'; script-src 'self' 'unsafe-inline'; "
            "style-src 'self' 'unsafe-inline'; img-src 'self' data:; "
            "font-src 'self'; connect-src 'self'; frame-ancestors 'none'",
        )
        self.send_header("Cache-Control", "no-store")

    def _send_json(self, obj, status: int = 200) -> None:
        body = json.dumps(obj).encode("utf-8")
        self.send_response(status)
        self._security_headers("application/json; charset=utf-8", len(body))
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path: str) -> None:
        ext = os.path.splitext(path)[1].lower()
        ctype = MIME.get(ext, "application/octet-stream")
        try:
            with open(path, "rb") as f:
                data = f.read()
        except OSError:
            body = b"Not found"
            self.send_response(HTTPStatus.NOT_FOUND)
            self._security_headers("text/plain; charset=utf-8", len(body))
            self.end_headers()
            self.wfile.write(body)
            return
        self.send_response(HTTPStatus.OK)
        self._security_headers(ctype, len(data))
        self.end_headers()
        self.wfile.write(data)

    def _redirect(self, location: str) -> None:
        self.send_response(HTTPStatus.FOUND)
        self.send_header("Location", location)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def _session_token(self) -> str:
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        morsel = cookie.get(COOKIE_NAME)
        return morsel.value if morsel else ""

    def _set_session_cookie(self, token: str) -> None:
        max_age = SESSION_HOURS * 3600
        self.send_header(
            "Set-Cookie",
            f"{COOKIE_NAME}={token}; Path={COOKIE_PATH}; Max-Age={max_age}; "
            f"HttpOnly; SameSite=Lax",
        )

    def _clear_session_cookie(self) -> None:
        self.send_header(
            "Set-Cookie",
            f"{COOKIE_NAME}=; Path={COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax",
        )

    def _require_csrf(self) -> None:
        if self.headers.get("X-Requested-With") != "XMLHttpRequest":
            raise ApiError(403, "Missing CSRF header")

    def _current_user(self):
        token = self._session_token()
        if not token:
            return None
        with db() as conn:
            return get_session_user(conn, token)

    def _require_auth(self, admin: bool = False):
        user = self._current_user()
        if not user:
            raise ApiError(401, "Not authenticated")
        if admin and user["role"] != "admin":
            raise ApiError(403, "Admin only")
        return user

    def _read_body(self) -> dict:
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length <= 0 or length > 1_000_000:
            return {}
        raw = self.rfile.read(length)
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise ApiError(400, "Invalid JSON")

    # ------------------------------------------------------------------
    # Routing
    # ------------------------------------------------------------------
    def do_GET(self) -> None:  # noqa: N802
        try:
            self._route("GET")
        except ApiError as e:
            self._send_json({"error": e.message}, e.status)
        except BrokenPipeError:
            pass
        except Exception:
            log.exception("Unhandled error on GET %s", self.path)
            try:
                self._send_json({"error": "Internal server error"}, 500)
            except Exception:
                pass

    def do_POST(self) -> None:  # noqa: N802
        try:
            # Always drain the request body so keep-alive stays in sync
            body = self._read_body()
            self._route("POST", body)
        except ApiError as e:
            self._send_json({"error": e.message}, e.status)
        except BrokenPipeError:
            pass
        except Exception:
            log.exception("Unhandled error on POST %s", self.path)
            try:
                self._send_json({"error": "Internal server error"}, 500)
            except Exception:
                pass

    def _route(self, method: str, body: dict | None = None) -> None:
        if body is None:
            body = {}
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        if len(path) > 1 and path.endswith("/"):
            path = path.rstrip("/")

        # --- Public routes ---
        if method == "GET" and path in ("/", "/login", "/login.html"):
            if path == "/":
                user = self._current_user()
                if user:
                    self._send_file(os.path.join(BASE_DIR, "index.html"))
                else:
                    self._redirect("/login")
                return
            self._send_file(os.path.join(BASE_DIR, "login.html"))
            return

        # Login page needs these before a session exists (UI strings + styling).
        # Everything else (app logic, lessons, quiz data) stays auth-gated.
        if method == "GET" and path in ("/js/i18n.js", "/css/styles.css"):
            self._serve_static(path)
            return

        if method == "POST" and path == "/api/login":
            self._handle_login(body)
            return

        if method == "POST" and path == "/api/logout":
            self._require_csrf()
            token = self._session_token()
            if token:
                with db() as conn:
                    destroy_session(conn, token)
            out = b"{}"
            self.send_response(200)
            self._security_headers("application/json; charset=utf-8", len(out))
            self._clear_session_cookie()
            self.end_headers()
            self.wfile.write(out)
            return

        if method == "GET" and path == "/api/me":
            user = self._require_auth()
            self._send_json(
                {
                    "username": user["username"],
                    "role": user["role"],
                    "last_login": user["last_login"],
                }
            )
            return

        if method == "POST" and path == "/api/change-password":
            self._require_csrf()
            user = self._require_auth()
            current = str(body.get("current", ""))
            new = str(body.get("new", ""))
            if len(new) < 6:
                raise ApiError(400, "New password must be at least 6 characters")
            with db() as conn:
                u = get_user_by_id(conn, user["id"])
                stored_hash = u["password_hash"] if u else None
                stored_salt = u["salt"] if u else None
            if not u or not verify_password(current, stored_hash, stored_salt):
                raise ApiError(400, "Current password is incorrect")
            h, s = hash_password(new)
            with db() as conn:
                conn.execute(
                    "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
                    (h, s, user["id"]),
                )
            self._send_json({"ok": True})
            return

        # --- Quiz scores ---
        if method == "POST" and path == "/api/quiz/score":
            self._require_csrf()
            user = self._require_auth()
            try:
                score = int(body.get("score", -1))
                total = int(body.get("total", -1))
            except (TypeError, ValueError):
                raise ApiError(400, "Invalid score")
            if total < 1 or total > 200 or score < 0 or score > total:
                raise ApiError(400, "Invalid score")
            pct = round(100 * score / total)
            with db() as conn:
                conn.execute(
                    "INSERT INTO quiz_scores (user_id, score, total, pct, created_at) "
                    "VALUES (?,?,?,?,?)",
                    (user["id"], score, total, pct, _utcnow()),
                )
                # keep only the latest 50 attempts per user
                conn.execute(
                    "DELETE FROM quiz_scores WHERE user_id = ? AND id NOT IN ("
                    "SELECT id FROM quiz_scores WHERE user_id = ? "
                    "ORDER BY id DESC LIMIT 50)",
                    (user["id"], user["id"]),
                )
            log.info("Quiz score: %s %d/%d (%d%%)", user["username"], score, total, pct)
            self._send_json({"ok": True, "pct": pct})
            return

        if method == "GET" and path == "/api/quiz/my":
            user = self._require_auth()
            with db() as conn:
                row = conn.execute(
                    "SELECT score, total, pct, created_at FROM quiz_scores "
                    "WHERE user_id = ? ORDER BY pct DESC, score DESC, id DESC LIMIT 1",
                    (user["id"],),
                ).fetchone()
                n = conn.execute(
                    "SELECT COUNT(*) AS n FROM quiz_scores WHERE user_id = ?",
                    (user["id"],),
                ).fetchone()["n"]
            self._send_json(
                {"attempts": n, "best": dict(row) if row else None}
            )
            return

        if method == "GET" and path == "/api/quiz/leaderboard":
            self._require_auth(admin=True)
            with db() as conn:
                rows = conn.execute(
                    """
                    SELECT username, score, total, pct, attempts, created_at FROM (
                        SELECT u.username, q.score, q.total, q.pct, q.created_at,
                            ROW_NUMBER() OVER (
                                PARTITION BY q.user_id
                                ORDER BY q.pct DESC, q.score DESC, q.created_at DESC
                            ) AS rn,
                            COUNT(*) OVER (PARTITION BY q.user_id) AS attempts
                        FROM quiz_scores q
                        JOIN users u ON u.id = q.user_id
                        WHERE u.enabled = 1
                    ) WHERE rn = 1
                    ORDER BY pct DESC, score DESC, username
                    """
                ).fetchall()
                no_attempt = [
                    r["username"]
                    for r in conn.execute(
                        "SELECT u.username FROM users u WHERE u.enabled = 1 "
                        "AND NOT EXISTS (SELECT 1 FROM quiz_scores q WHERE q.user_id = u.id) "
                        "ORDER BY u.username"
                    ).fetchall()
                ]
            self._send_json(
                {"leaderboard": [dict(r) for r in rows], "not_attempted": no_attempt}
            )
            return

        # --- Admin routes ---
        if method == "GET" and path == "/admin":
            user = self._require_auth(admin=True)
            self._send_file(os.path.join(BASE_DIR, "admin.html"))
            return

        if method == "GET" and path == "/api/admin/users":
            self._require_auth(admin=True)
            with db() as conn:
                rows = conn.execute(
                    "SELECT u.username, u.role, u.enabled, u.last_login, u.created_at, "
                    "(SELECT COUNT(*) FROM sessions s WHERE s.user_id = u.id) AS sessions "
                    "FROM users u ORDER BY u.role DESC, u.username"
                ).fetchall()
            self._send_json({"users": [dict(r) for r in rows]})
            return

        if method == "POST" and path.startswith("/api/admin/users/"):
            self._require_csrf()
            admin_user = self._require_auth(admin=True)
            rest = path[len("/api/admin/users/") :]
            parts = rest.split("/")
            if len(parts) != 2:
                raise ApiError(404, "Not found")
            username, action = urllib.parse.unquote(parts[0]), parts[1]

            if action == "password":
                new = str(body.get("password", ""))
                if len(new) < 6:
                    raise ApiError(400, "Password must be at least 6 characters")
                with db() as conn:
                    target = get_user_by_username(conn, username)
                    if not target:
                        raise ApiError(404, "User not found")
                    target_id = target["id"]
                h, s = hash_password(new)
                with db() as conn:
                    conn.execute(
                        "UPDATE users SET password_hash = ?, salt = ? WHERE id = ?",
                        (h, s, target_id),
                    )
                    destroy_user_sessions(conn, target_id)
                log.info("Admin %s reset password for %s", admin_user["username"], username)
                self._send_json({"ok": True})
                return

            if action == "toggle":
                with db() as conn:
                    target = get_user_by_username(conn, username)
                    if not target:
                        raise ApiError(404, "User not found")
                    if target["role"] == "admin":
                        raise ApiError(400, "Cannot disable admin")
                    new_state = 0 if target["enabled"] else 1
                    conn.execute(
                        "UPDATE users SET enabled = ? WHERE id = ?",
                        (new_state, target["id"]),
                    )
                    if new_state == 0:
                        destroy_user_sessions(conn, target["id"])
                log.info(
                    "Admin %s set %s enabled=%s", admin_user["username"], username, new_state
                )
                self._send_json({"ok": True, "enabled": bool(new_state)})
                return

            if action == "sessions":
                with db() as conn:
                    target = get_user_by_username(conn, username)
                    if not target:
                        raise ApiError(404, "User not found")
                    destroy_user_sessions(conn, target["id"])
                log.info("Admin %s revoked sessions for %s", admin_user["username"], username)
                self._send_json({"ok": True})
                return

            raise ApiError(404, "Not found")

        # --- Static files (auth required) ---
        if method == "GET":
            user = self._current_user()
            if not user:
                if path.startswith("/api/"):
                    raise ApiError(401, "Not authenticated")
                self._redirect("/login")
                return
            self._serve_static(path)
            return

        raise ApiError(404, "Not found")

    # ------------------------------------------------------------------
    # Handlers
    # ------------------------------------------------------------------
    def _handle_login(self, body: dict) -> None:
        username = str(body.get("username", "")).strip().lower()
        password = str(body.get("password", ""))
        ip = client_ip(self)

        if not username or not password:
            raise ApiError(400, "Username and password required")
        if len(username) > 64 or len(password) > 256:
            raise ApiError(400, "Invalid credentials")

        # Fetch user + lockout check (short DB work)
        with db() as conn:
            if is_locked_out(conn, username, ip):
                raise ApiError(429, "Too many attempts. Try again in 15 minutes.")
            user = get_user_by_username(conn, username)
            stored_hash = user["password_hash"] if user else None
            stored_salt = user["salt"] if user else None
            enabled = bool(user and user["enabled"])

        # PBKDF2 outside the lock so concurrent logins don't serialize
        ok = bool(
            enabled
            and stored_hash
            and stored_salt
            and verify_password(password, stored_hash, stored_salt)
        )

        if not ok:
            with db() as conn:
                record_attempt(conn, username, ip, False)
            raise ApiError(401, "Invalid username or password")

        with db() as conn:
            record_attempt(conn, username, ip, True)
            conn.execute(
                "UPDATE users SET last_login = ? WHERE id = ?", (_utcnow(), user["id"])
            )
            token = create_session(conn, user["id"], ip, self.headers.get("User-Agent", ""))

        log.info("Login OK: %s from %s", username, ip)
        payload = json.dumps(
            {"ok": True, "username": user["username"], "role": user["role"]}
        ).encode()
        self.send_response(200)
        self._security_headers("application/json; charset=utf-8", len(payload))
        self._set_session_cookie(token)
        self.end_headers()
        self.wfile.write(payload)

    def _serve_static(self, path: str) -> None:
        # Decode %2e etc, then reject anything that escapes BASE_DIR
        rel = urllib.parse.unquote(path).lstrip("/")
        if not rel:
            rel = "index.html"
        full = os.path.realpath(os.path.join(BASE_DIR, rel))
        base = os.path.realpath(BASE_DIR)
        if not (full == base or full.startswith(base + os.sep)):
            raise ApiError(403, "Forbidden")
        if os.path.isdir(full):
            full = os.path.join(full, "index.html")
        if not os.path.isfile(full):
            raise ApiError(404, "Not found")
        self._send_file(full)


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
class Server(ThreadingHTTPServer):
    # Allow ~30 simultaneous connections without refusing any
    request_queue_size = 128
    daemon_threads = True
    allow_reuse_address = True


def run() -> None:
    init_db()
    try:
        cleanup_expired()
    except Exception:
        log.exception("Initial cleanup failed")

    def _cleaner():
        while True:
            time.sleep(3600)
            try:
                cleanup_expired()
            except Exception:
                log.exception("Cleanup failed")

    threading.Thread(target=_cleaner, daemon=True).start()

    httpd = Server((HOST, PORT), Handler)
    log.info("SPC Trainer server listening on http://%s:%d", HOST, PORT)
    log.info("Accounts: admin, user1..user30 (default password set)")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down...")
    finally:
        httpd.server_close()


if __name__ == "__main__":
    run()
