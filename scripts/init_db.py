from dotenv import load_dotenv
import os
import psycopg

load_dotenv(override=True)

def get_db_url():
    return os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

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
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'feita')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
"""


def main():
    url = get_db_url()
    if not url:
        print("DATABASE_URL/NEON_DATABASE_URL not configured")
        return
    print("Connecting to:", url.split("@")[-1][:200])
    try:
        with psycopg.connect(url) as conn:
            with conn.cursor() as cur:
                print("Dropping existing tables...")
                cur.execute("DROP TABLE IF EXISTS routines CASCADE;")
                cur.execute("DROP TABLE IF EXISTS users CASCADE;")
                
                print("Creating new schema...")
                cur.execute(USERS_TABLE_SQL)
                cur.execute(ROUTINES_TABLE_SQL)
                conn.commit()
        print("Schema applied successfully")
    except Exception as e:
        print("Error applying schema:", e)

if __name__ == '__main__':
    main()
