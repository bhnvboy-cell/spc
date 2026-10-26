# 📈 SPC Trainer

A production-ready, multi-user Statistical Process Control (SPC) training app for phones, tablets, and PCs on a local network. Learn control charts, process capability (Cp/Cpk), Gage R&R, Pareto analysis — and take quizzes with tracked scores.

**Stack:** vanilla HTML/CSS/JS frontend · Python stdlib backend (zero third-party dependencies) · SQLite storage.

---

## 🚀 Quick start

1. Double-click **`start.bat`**
2. Browser opens at `http://localhost:8765`
3. Print/share the LAN URL shown in the console window — trainees on the same Wi-Fi open it on their devices:

   ```
   http://<your-LAN-IP>:8765
   ```

Stop the server: **`kill.bat`** (or close the server window).

> Requirements: Python 3 (`py` or `python` on PATH). No pip installs, no Node, no internet needed.

---

## 🔑 Accounts

| Username | Role | Password |
|---|---|---|
| `admin` | Admin (manages users, sees leaderboard) | `mefsco123` |
| `user1` … `user30` | Trainees | `mefsco123` |

**Default password for all accounts:** `mefsco123`

> Change it from the **Admin panel** before a real session.

---

## ⚙️ Admin panel

Log in as `admin` → **Admin** button in the header (or `/admin`).

- **🏆 Quiz leaderboard** — best score per user, %, attempts, timestamp, plus who hasn't attempted yet (auto-refreshes every 15 s)
- **User management** — enable/disable accounts, force logout ("Kick"), reset anyone's password
- **Live stats** — total accounts, active sessions, disabled count
- **Change own password**

---

## 📊 App features

| Tab | Contents |
|---|---|
| 📚 Learn | SPC lessons (EN/HI/BN/AR) |
| 📊 Charts | X̄-R, X̄-S, I-MR, p, np, c, u, EWMA, CUSUM, Laney p′/u′ — with Nelson rule violations |
| 🎯 Cpk | Cp/Cpk/Pp/Ppk capability analysis + Cpk planner |
| 🧰 Tools | Gage R&R (ANOVA), Pareto, data import (paste/CSV), demo data |
| 🧠 Quiz | 14-question MCQ quiz — **scores saved to the server automatically** |

Each user's worksheet data stays in their own browser (nothing shared between devices).

---

## 🔒 Security

- PBKDF2-HMAC-SHA256 password hashing (200k iterations, per-user salt)
- 12-hour sessions, HttpOnly + SameSite cookies
- Login rate-limiting: 5 failed attempts → 15-minute lockout
- CSRF protection on all state-changing APIs (`X-Requested-With` header)
- Path-traversal blocking, CSP / X-Frame-Options / nosniff security headers
- Uniform auth errors, request logging

---

## 🏗️ Architecture

```
Browser (all SPC computation)  ──HTTP──▶  server.py (Python stdlib, threaded)
  ├── js/stats.js  — control limits, Nelson rules, capability, GRR        ├── auth + sessions (SQLite)
  ├── js/charts.js — canvas chart rendering                               ├── static file serving
  ├── js/app.js    — UI controller + quiz score sync                      └── admin/quiz APIs
  └── localStorage — language + lesson index + theme only
```

- **No build step, no frameworks, no npm, no pip** — one Python file runs everything
- Threaded server tested with **30 concurrent users** (login → app → API → logout: 30/30 OK)
- SQLite in WAL mode; PBKDF2 runs outside the DB lock so simultaneous logins don't serialize

---

## 📁 Files

| Path | Purpose |
|---|---|
| `start.bat` | Launch server + open browser (port 8765) |
| `kill.bat` | Stop the server |
| `server.py` | Auth server: sessions, admin API, quiz scores, static serving |
| `login.html` | Login page |
| `admin.html` | Admin panel (users + leaderboard) |
| `index.html` | Main app (requires login) |
| `css/styles.css` | All styles |
| `js/app.js` | UI controller, worksheets, quiz (posts scores) |
| `js/stats.js` | SPC statistics engine (Node-compatible) |
| `js/charts.js` | Canvas chart renderer |
| `js/i18n.js` | Translations (EN/HI/BN/AR) |
| `js/lessons.js` | Lesson content + demo data |
| `js/quiz.js` | Quiz questions |
| `js/auth.js` | In-app user bar (password change / logout / admin link) |
| `js/translations_*.hi/bn/ar.js` | Lesson/quiz translations |
| `spc_users.db` | SQLite database (auto-created & seeded on first run) |
| `test_server.py` | 30-check regression suite (`py test_server.py`) |

---

## 🧪 Tests

```bash
py test_server.py
```

30 checks covering: login/logout, role enforcement, CSRF, lockout, password reset/disable/kick, path traversal, static serving, quiz scores & leaderboard. Exit code `0` = all pass.

---

## 🔄 Reset everything

Stop the server, delete `spc_users.db*`, restart — all accounts re-seed with default passwords and empty quiz history.

---

## 📝 Notes

- **Add more than 30 users?** Edit `USERS` in `server.py` and restart (database re-seeds new accounts only).
- **Change default password?** Edit `DEFAULT_PASSWORD` in `server.py` **before first run** (or reset passwords from the admin panel afterwards).
- **Port in use?** Change `PORT` in `server.py` and `start.bat`.
- Works fully offline after files are local — no CDN, no analytics, no external calls.
