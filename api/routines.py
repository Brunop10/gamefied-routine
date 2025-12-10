from http.server import BaseHTTPRequestHandler
import os
import json
import psycopg
import secrets
import time
import hmac
import hashlib
import base64
import urllib.parse
import urllib.request
from dotenv import load_dotenv

load_dotenv(override=True)

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

JWT_EXP_SECONDS = 60 * 60 * 24 * 30  # 30 dias

USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""

ROUTINES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS routines (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


class handler(BaseHTTPRequestHandler):
    # -------- Utilidades --------
    def _add_cors_headers(self):
        """Adiciona headers CORS necessários"""
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def _write_json(self, status: int, payload: dict, headers: dict | None = None):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self._add_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        if headers:
            for k, v in headers.items():
                self.send_header(k, v)
        self.end_headers()
        self.wfile.write(body)

    def _parse_path(self):
        return self.path.split("?", 1)[0]

    def _get_db_url(self):
        return os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

    def _connect(self):
        url = self._get_db_url()
        if not url:
            raise RuntimeError("DATABASE_URL/NEON_DATABASE_URL não configurado")
        if "sslmode" not in url:
            url = f"{url}?sslmode=require"
        return psycopg.connect(url)

    def _ensure_schema(self, cur):
        cur.execute(USERS_TABLE_SQL)
        cur.execute(ROUTINES_TABLE_SQL)
        # Garantir coluna user_id mesmo se tabela antiga existir
        cur.execute(
            "SELECT column_name FROM information_schema.columns WHERE table_name='routines' AND column_name='user_id'"
        )
        has_user_id = cur.fetchone()
        if not has_user_id:
            cur.execute("ALTER TABLE routines ADD COLUMN user_id INTEGER")
        cur.execute("ALTER TABLE routines DROP CONSTRAINT IF EXISTS routines_user_id_fkey")
        cur.execute(
            "ALTER TABLE routines ADD CONSTRAINT routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE"
        )
        cur.execute("DELETE FROM routines WHERE user_id IS NULL")
        cur.execute("ALTER TABLE routines ALTER COLUMN user_id SET NOT NULL")

    # -------- JWT helpers --------
    def _b64url_encode(self, data: bytes) -> str:
        return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")

    def _b64url_decode(self, data: str) -> bytes:
        padding = "=" * (-len(data) % 4)
        return base64.urlsafe_b64decode(data + padding)

    def _jwt_sign(self, payload: dict) -> str:
        secret = os.getenv("JWT_SECRET")
        if not secret:
            raise RuntimeError("JWT_SECRET não configurado")
        header = {"alg": "HS256", "typ": "JWT"}
        payload = payload.copy()
        payload["exp"] = int(time.time()) + JWT_EXP_SECONDS
        h64 = self._b64url_encode(json.dumps(header, separators=(",", ":")).encode())
        p64 = self._b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
        msg = f"{h64}.{p64}".encode()
        sig = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
        s64 = self._b64url_encode(sig)
        return f"{h64}.{p64}.{s64}"

    def _jwt_verify(self, token: str) -> dict:
        secret = os.getenv("JWT_SECRET")
        if not secret:
            raise RuntimeError("JWT_SECRET não configurado")
        try:
            h64, p64, s64 = token.split(".")
            msg = f"{h64}.{p64}".encode()
            sig = self._b64url_decode(s64)
            expected = hmac.new(secret.encode(), msg, hashlib.sha256).digest()
            if not hmac.compare_digest(sig, expected):
                raise ValueError("assinatura inválida")
            payload = json.loads(self._b64url_decode(p64))
            if payload.get("exp", 0) < int(time.time()):
                raise ValueError("token expirado")
            return payload
        except Exception as e:
            raise ValueError(f"token inválido: {e}")

    def _get_cookies(self) -> dict:
        raw = self.headers.get("Cookie", "")
        cookies = {}
        for part in raw.split(";"):
            if "=" in part:
                k, v = part.strip().split("=", 1)
                cookies[k] = v
        return cookies

    def _get_session(self) -> dict | None:
        cookies = self._get_cookies()
        tok = cookies.get("session")
        if not tok:
            return None
        try:
            return self._jwt_verify(tok)
        except Exception:
            return None

    def _require_user(self):
        session = self._get_session()
        if not session:
            self._write_json(401, {"ok": False, "error": "não autenticado"})
            return None
        return session

    def _is_secure(self) -> bool:
        proto = self.headers.get("X-Forwarded-Proto", "")
        # Se X-Forwarded-Proto for "https", retorna True
        if proto == "https":
            return True
        # Em produção (Vercel), o header pode não vir — detecta por hostname
        host = self.headers.get("Host", "")
        if host and ("vercel.app" in host or host == "localhost"):
            # localhost = dev (http), vercel.app = produção (https)
            return "vercel.app" in host
        return False

    def _redirect(self, url: str, extra_headers: dict | None = None):
        self.send_response(302)
        self._add_cors_headers()
        self.send_header("Location", url)
        if extra_headers:
            for k, v in extra_headers.items():
                self.send_header(k, v)
        self.end_headers()

    # -------- Auth Google --------
    def _api_base(self):
        # Prioridade: variável de ambiente > auto-detect
        env = os.getenv("API_BASE_URL")
        if env:
            return env.rstrip("/")
        
        # Se não configurado, tenta auto-detect (útil para produção com reverse proxy)
        host = self.headers.get("Host", "").rstrip("/")
        proto = "https" if self._is_secure() else "http"
        if not host:
            # Fallback - isso não deveria acontecer
            return "http://localhost:3000"
        return f"{proto}://{host}"

    def _auth_start(self):
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            self._write_json(500, {"ok": False, "error": "GOOGLE_CLIENT_ID não configurado"})
            return
        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or f"{self._api_base()}/api/auth/google/callback"
        print(f"[DEBUG] GOOGLE_CLIENT_ID env: {client_id}")
        print(f"[DEBUG] GOOGLE_REDIRECT_URI env: {os.getenv('GOOGLE_REDIRECT_URI')}")
        print(f"[DEBUG] _api_base(): {self._api_base()}")
        print(f"[DEBUG] redirect_uri: {redirect_uri}")
        print(f"[DEBUG] Host header: {self.headers.get('Host')}")
        print(f"[DEBUG] X-Forwarded-Proto: {self.headers.get('X-Forwarded-Proto')}")
        state = secrets.token_urlsafe(16)
        params = {
            "client_id": client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "prompt": "consent",
            "access_type": "online",
            "include_granted_scopes": "true",
        }
        cookie_flags = "Path=/; HttpOnly; SameSite=Lax"
        if self._is_secure():
            cookie_flags += "; Secure"
        auth_url = f"{GOOGLE_AUTH_URL}?{urllib.parse.urlencode(params)}"
        print(f"[DEBUG] auth_url: {auth_url}")
        self._redirect(
            auth_url,
            extra_headers={"Set-Cookie": f"oauth_state={state}; {cookie_flags}"},
        )

    def _auth_callback(self):
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        code = params.get("code", [None])[0]
        state = params.get("state", [None])[0]
        cookie_state = self._get_cookies().get("oauth_state")
        if not code or not state or state != cookie_state:
            self._write_json(400, {"ok": False, "error": "state inválido"})
            return

        client_id = os.getenv("GOOGLE_CLIENT_ID")
        client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
        if not client_id or not client_secret:
            self._write_json(500, {"ok": False, "error": "Credenciais Google ausentes"})
            return

        redirect_uri = os.getenv("GOOGLE_REDIRECT_URI") or f"{self._api_base()}/api/auth/google/callback"
        print(f"[DEBUG CALLBACK] GOOGLE_CLIENT_ID env: {client_id}")
        print(f"[DEBUG CALLBACK] GOOGLE_REDIRECT_URI env: {os.getenv('GOOGLE_REDIRECT_URI')}")
        print(f"[DEBUG CALLBACK] redirect_uri: {redirect_uri}")
        data = urllib.parse.urlencode({
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }).encode()
        try:
            with urllib.request.urlopen(urllib.request.Request(GOOGLE_TOKEN_URL, data=data)) as resp:
                token_body = json.loads(resp.read().decode())
            access_token = token_body.get("access_token")
            if not access_token:
                raise RuntimeError("token não retornado")
            req = urllib.request.Request(GOOGLE_USERINFO_URL, headers={"Authorization": f"Bearer {access_token}"})
            with urllib.request.urlopen(req) as resp:
                userinfo = json.loads(resp.read().decode())
        except Exception as e:
            self._write_json(500, {"ok": False, "error": f"falha no login: {e}"})
            return

        sub = userinfo.get("sub")
        email = userinfo.get("email")
        name = userinfo.get("name")
        picture = userinfo.get("picture")
        if not sub or not email:
            self._write_json(400, {"ok": False, "error": "perfil inválido"})
            return

        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    self._ensure_schema(cur)
                    cur.execute(
                        """
                        INSERT INTO users(provider, provider_id, email, name, picture)
                        VALUES(%s, %s, %s, %s, %s)
                        ON CONFLICT(provider_id) DO UPDATE
                        SET email=EXCLUDED.email, name=EXCLUDED.name, picture=EXCLUDED.picture
                        RETURNING id, email, name, picture
                        """,
                        ("google", sub, email, name, picture),
                    )
                    user_row = cur.fetchone()
                    conn.commit()
        except Exception as e:
            self._write_json(500, {"ok": False, "error": f"db error: {e}"})
            return

        token = self._jwt_sign({"uid": user_row[0], "email": user_row[1], "name": user_row[2]})
        cookie_flags = "Path=/; HttpOnly; SameSite=Lax"
        if self._is_secure():
            cookie_flags += "; Secure"
        headers = {"Set-Cookie": f"session={token}; {cookie_flags}"}
        app_base = os.getenv("APP_BASE_URL") or "/"
        self._redirect(app_base, headers)

    def _me(self):
        session = self._get_session()
        if not session:
            self._write_json(401, {"ok": False, "error": "não autenticado"})
            return
        user = None
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, email, name, picture FROM users WHERE id = %s", (session["uid"],))
                    user = cur.fetchone()
        except Exception:
            user = None
        if not user:
            self._write_json(401, {"ok": False, "error": "não autenticado"})
            return
        self._write_json(200, {"ok": True, "user": {"id": user[0], "email": user[1], "name": user[2], "picture": user[3]}})

    def _logout(self):
        cookie_flags = "Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
        if self._is_secure():
            cookie_flags += "; Secure"
        self._write_json(200, {"ok": True}, headers={"Set-Cookie": f"session=; {cookie_flags}"})

    # -------- Rotinas --------
    def _list_routines(self, user):
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    self._ensure_schema(cur)
                    cur.execute(
                        "SELECT id, title, created_at FROM routines WHERE user_id = %s ORDER BY created_at DESC",
                        (user["uid"],),
                    )
                    rows = cur.fetchall()
            items = [{"id": r[0], "title": r[1], "created_at": r[2].isoformat()} for r in rows]
            self._write_json(200, {"ok": True, "items": items})
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

    def _create_routine(self, user, payload):
        title = (payload.get("title") or "").strip()
        if not title:
            self._write_json(400, {"ok": False, "error": "title é obrigatório"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    self._ensure_schema(cur)
                    cur.execute(
                        "INSERT INTO routines(user_id, title) VALUES(%s, %s) RETURNING id, created_at",
                        (user["uid"], title),
                    )
                    inserted = cur.fetchone()
                    conn.commit()
            self._write_json(201, {
                "ok": True,
                "item": {"id": inserted[0], "title": title, "created_at": inserted[1].isoformat()},
            })
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

    def _update_routine(self, user, payload):
        try:
            rid = int(payload.get("id"))
        except Exception:
            rid = 0
        title = (payload.get("title") or "").strip()
        if rid <= 0 or not title:
            self._write_json(400, {"ok": False, "error": "id e title são obrigatórios"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    self._ensure_schema(cur)
                    cur.execute(
                        "UPDATE routines SET title = %s WHERE id = %s AND user_id = %s RETURNING id, title, created_at",
                        (title, rid, user["uid"]),
                    )
                    row = cur.fetchone()
                    conn.commit()
            if not row:
                self._write_json(404, {"ok": False, "error": "rotina não encontrada"})
                return
            self._write_json(200, {"ok": True, "item": {"id": row[0], "title": row[1], "created_at": row[2].isoformat()}})
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

    def _delete_routine(self, user, payload):
        try:
            rid = int(payload.get("id"))
        except Exception:
            rid = 0
        if rid <= 0:
            self._write_json(400, {"ok": False, "error": "id é obrigatório"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    self._ensure_schema(cur)
                    cur.execute("DELETE FROM routines WHERE id = %s AND user_id = %s RETURNING id", (rid, user["uid"]))
                    row = cur.fetchone()
                    conn.commit()
            if not row:
                self._write_json(404, {"ok": False, "error": "rotina não encontrada"})
                return
            self._write_json(200, {"ok": True, "deleted_id": row[0]})
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

    # -------- Dispatch HTTP --------
    def do_GET(self):
        path = self._parse_path()
        if path == "/api/auth/google/start":
            return self._auth_start()
        if path == "/api/auth/google/callback":
            return self._auth_callback()
        if path == "/api/me":
            return self._me()
        if path == "/api/routines":
            user = self._require_user()
            if not user:
                return
            return self._list_routines(user)
        self._write_json(404, {"ok": False, "error": "not found"})

    def do_POST(self):
        path = self._parse_path()
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}

        if path == "/api/auth/google/start":
            return self._auth_start()
        if path == "/api/logout":
            return self._logout()
        if path == "/api/routines":
            user = self._require_user()
            if not user:
                return
            return self._create_routine(user, payload)
        self._write_json(404, {"ok": False, "error": "not found"})

    def do_PUT(self):
        path = self._parse_path()
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}
        if path == "/api/routines":
            user = self._require_user()
            if not user:
                return
            return self._update_routine(user, payload)
        self._write_json(404, {"ok": False, "error": "not found"})

    def do_DELETE(self):
        path = self._parse_path()
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}
        if path == "/api/routines":
            user = self._require_user()
            if not user:
                return
            return self._delete_routine(user, payload)
        self._write_json(404, {"ok": False, "error": "not found"})

    def do_OPTIONS(self):
        """Handle CORS preflight requests"""
        self.send_response(200)
        self._add_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()


if __name__ == "__main__":
    from http.server import HTTPServer
    port = int(os.getenv("PORT", "3000"))
    host = os.getenv("HOST", "0.0.0.0")
    print(f"Starting server on {host}:{port}")
    HTTPServer((host, port), handler).serve_forever()

