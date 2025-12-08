from http.server import BaseHTTPRequestHandler
import os
import json
from dotenv import load_dotenv

load_dotenv()


class handler(BaseHTTPRequestHandler):
    def _write_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        db_url = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")
        self._write_json(200, {
            "ok": True,
            "name": "gamefied-routine",
            "env": {
                "has_database_url": bool(db_url),
            },
            "message": "Python API online",
        })

if __name__ == "__main__":
    from http.server import HTTPServer
    HTTPServer(("localhost", 3000), handler).serve_forever()

