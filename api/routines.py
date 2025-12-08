from http.server import BaseHTTPRequestHandler
import os
import json
import psycopg
from dotenv import load_dotenv

load_dotenv()


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

    def do_PUT(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}
        try:
            id_val = int(payload.get("id"))
        except Exception:
            id_val = 0
        title = (payload.get("title") or "").strip()
        if id_val <= 0 or not title:
            self._write_json(400, {"ok": False, "error": "id e title são obrigatórios"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute(TABLE_SQL)
                    cur.execute(
                        "UPDATE routines SET title = %s WHERE id = %s RETURNING id, title, created_at",
                        (title, id_val),
                    )
                    row = cur.fetchone()
                    conn.commit()
            if not row:
                self._write_json(404, {"ok": False, "error": "rotina não encontrada"})
                return
            self._write_json(200, {
                "ok": True,
                "item": {"id": row[0], "title": row[1], "created_at": row[2].isoformat()},
            })
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

    def do_DELETE(self):
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length) if length > 0 else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8"))
        except Exception:
            payload = {}
        try:
            id_val = int(payload.get("id"))
        except Exception:
            id_val = 0
        if id_val <= 0:
            self._write_json(400, {"ok": False, "error": "id é obrigatório"})
            return
        try:
            with self._connect() as conn:
                with conn.cursor() as cur:
                    cur.execute(TABLE_SQL)
                    cur.execute("DELETE FROM routines WHERE id = %s RETURNING id", (id_val,))
                    row = cur.fetchone()
                    conn.commit()
            if not row:
                self._write_json(404, {"ok": False, "error": "rotina não encontrada"})
                return
            self._write_json(200, {"ok": True, "deleted_id": row[0]})
        except Exception as e:
            self._write_json(500, {"ok": False, "error": str(e)})

if __name__ == "__main__":
    from http.server import HTTPServer
    HTTPServer(("localhost", 3000), handler).serve_forever()
