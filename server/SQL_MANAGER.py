import json
import pymssql
import CYPHER


# ----------------------------------------------------
# LOAD CONFIG
def load_config(path="./DBconfigPYTHON.json"):
    with open(path, "r", encoding="utf-8") as f:
        raw = f.read()

    try:
        return json.loads(raw)
    except Exception:
        decrypted = CYPHER.decrypt("Fidelio99", raw)
        return json.loads(decrypted)


# global config (loaded once)
CONFIG = load_config()


# ----------------------------------------------------
# CONNECTION
def create_connection():
    return pymssql.connect(
        server=CONFIG["server"],
        user=CONFIG["user"],
        password=CONFIG["password"],
        database=CONFIG["database"],
    )


# ----------------------------------------------------
# EXECUTE QUERY
def execute_query(query, fetch=True):
    conn = create_connection()

    try:
        cursor = conn.cursor(as_dict=True)
        cursor.execute(query)

        if fetch: 
            return cursor.fetchall()

        conn.commit()
        return []

    except Exception as e:
        conn.rollback()
        print("SQL ERROR:: ",e)
        raise e

    finally:
        conn.close()


# ----------------------------------------------------
# SELECT
def select_query(query):
    return execute_query(query, fetch=True)


# ----------------------------------------------------
# INSERT / UPDATE
def insert_query(query):
    return execute_query(query, fetch=False)


# ----------------------------------------------------
# LOAD CONFIG FROM DB
def load_config_from_db(tabella, profile, chiave="DBCONFIG"):
    query = f"""
    SELECT KEY_VALUE
    FROM {tabella}
    WHERE PROFILE='{profile}' AND KEY_DEF='{chiave}'
    """

    res = select(query)

    if not res:
        return None

    return json.loads(res[0]["KEY_VALUE"].replace(" ", ""))