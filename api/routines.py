from http.server import BaseHTTPRequestHandler
import os
import json
import psycopg


TABLE_SQL = """
CREATE TABLE IF NOT EXISTS routines (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


class handler(BaseHTTPRequestHandler):
    def _write_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _get_db_url(self):
        return os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

    def _connect(self):
        url = self._get_db_url()
        if not url:
            raise RuntimeError("DATABASE_URL/NEON_DATABASE_URL não configurado")
        # Neon requer SSL
        if "sslmode" not in url:
            url = f"{url}?sslmode=require"
        return psycopg.connect(url)

    def do_GET(self):
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute(TABLE_SQL)
                    cur.execute("SELECT id, title, created_at FROM routines ORDER BY created_at DESC")
                    rows = cur.fetchall()
            items = [
                {"id": r[0], "title": r[1], "created_at": r[2].isoformat()}
                for r in rows
            ]
            self._write_json(200, {"ok": True, "items": items})
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

if __name__ == "__main__":
    from http.server import HTTPServer
    HTTPServer(("localhost", 3000), handler).serve_forever()

    def do_POST(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}
        title = (payload.get("title") or "").strip()
        if not title:
            self._write_json(400, {"ok": False, "error": "title é obrigatório"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute(TABLE_SQL)
                    cur.execute("INSERT INTO routines(title) VALUES(%s) RETURNING id, created_at", (title,))
                    inserted = cur.fetchone()
                    conn.commit()
            self._write_json(201, {
                "ok": True,
                "item": {"id": inserted[0], "title": title, "created_at": inserted[1].isoformat()},
            })
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})
