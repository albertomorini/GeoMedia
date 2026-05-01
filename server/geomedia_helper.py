import json
import os
import base64
from pathlib import Path

import SQL_MANAGER
import mailer

# Load config
with open("./config.json") as f:
    config = json.load(f)

PATH_UPLOADS = config["FOLDERS"]["UPLOADS"]


# ------------------------
# LOGGING

def writeLog(message, scope="ERROR"):
    try:
        message = str(message).replace("'", "''")

        query = f"EXEC DBO.LOG_WRITE @MESSAGE='{message}', @SCOPE='{scope}'"
        SQL_MANAGER.select_query(query)

    except Exception:
        with open("./log.txt", "a") as f:
            f.write(f"{scope},{int(__import__('time').time())},{message}\n")


# ------------------------
# GENERIC QUERY

async def generic_query(path: str, body: dict):
    dummy = json.dumps(body).replace("'", "''")
    query = f"EXEC {path.replace('/', '')} @JSON='{dummy}'"
    print("EXECUTING",query)
    return SQL_MANAGER.select_query(query)


# ------------------------
# POST / COLLECTION

async def post_merge(post_content: dict):
    dummy = json.dumps(post_content).replace("'", "''")
    query = f"EXEC dbo.POST_MERGE @POST_CONTENT='{dummy}'"
    return SQL_MANAGER.select_query(query)


async def collection_merge(collection: dict):
    dummy = json.dumps(collection).replace("'", "''") # to escale the apix
    query = f"EXEC dbo.COLLECTION_MERGE @JSON='{dummy}'"
    return SQL_MANAGER.select_query(query)

async def hashtag_get():
    return SQL_MANAGER.select_query("SELECT TITLE FROM DBO.HASHTAGS")

# ------------------------
# FILE HANDLING

async def hpmedia_merge_folder(postid: int, attachments: list):
    try:
        post_folder = Path(PATH_UPLOADS) / str(postid)
        post_folder.mkdir(parents=True, exist_ok=True)
        hypermedia_reference = []

        # for f in filter(lambda x: x.get("UPDATED"), attachments):
        for f in attachments:
            print(f.keys())

            buffer = base64.b64decode(f.get("base64"))
            filepath = post_folder / f.get("filename")

            with open(filepath, "wb") as file:
                file.write(buffer)

            hypermedia_reference.append({
                "filename": f.get("filename"),
                "filepath": str(filepath),
                "mimetype": f.get("mime_type"),
                "post_id": postid
            })

        # Remove not incldued files
        file_present = os.listdir(post_folder)
        filenames = [f.get("filename") for f in attachments]

        for f in file_present:
            if f not in filenames:
                os.remove(post_folder / f)

        json_str = json.dumps(hypermedia_reference).replace("'", "''")

        query = (
            "EXEC HPMEDIA_MERGEFILE "
            f"@FILESNAME_ATTACHED='{json_str}',"
            f"@POSTID={postid}"
        )

        return SQL_MANAGER.select_query( query)

    except Exception as e:
        writeLog(f"Error on merge_folder: {e}", "HPMEDIA")
        print(e)
        return [{"OK": False, "MSG": str(e)}]


async def hpmedia_read_folder(postid: int):
    query = f"EXEC HPMEDIA_GETFILES @POSTID={postid}"

    files = SQL_MANAGER.select_query( query)

    for f in files:
        try:
            with open(f.get("FILEPATH"), "rb") as file:
                f["BASE64"] = base64.b64encode(file.read()).decode()
        except Exception:
            f["BASE64"] = None

    return files


async def hpmedia_remove(postid:int, filename:str):
    try:
        post_full_path = Path(PATH_UPLOADS) / str(postid) /filename
        os.remove(post_full_path)
        return await select_query("hpmedia_remove",{
            "postid": postid,
            "filename": filename
        })
    except Exception as e:
        writeLog(f"Cannot delete file: {filename}, error {e.message}","ERROR")
        return false

# ------------------------
# AUTH

async def auth_signin(procedure: str, body: dict):
    try:
        query_results = await generic_query(procedure, body)
        query_results = query_results[0]

        email = body.get("EMAIL")
        username = body.get("USERNAME")

        if query_results.get("EMAIL") and query_results.get("USERNAME"):
            email = query_results["EMAIL"]
            username = query_results["USERNAME"]

        if query_results.get("AUTH") == 2:
            print("INVIO EMAIL")
            mailer.send_email_otp(
                email,
                {"USERNAME": username, "OTP": query_results.get("OTP")}
            )

            writeLog(f"OTP requested for: {email}", "OTP")
            query_results.pop("OTP", None)

        return query_results

    except Exception as e:
        return {"error": str(e), "AUTH": 0}


# ------------------------
# GEO LOGIC

def checkAREA(areaKM, post_lat, post_lon, curr_lat, curr_lon):
    from math import cos, asin, sqrt, pi

    dLat = (post_lat - curr_lat) * pi / 180
    dLon = (post_lon - curr_lon) * pi / 180

    a = (
        0.5
        - cos(dLat) / 2
        + cos(curr_lat * pi / 180)
        * cos(post_lat * pi / 180)
        * (1 - cos(dLon)) / 2
    )

    d = round(6371000 * 2 * asin(sqrt(a)))

    return d <= areaKM * 1000


async def post_get_map(uid, current_position, collection_chosen=None):
    if collection_chosen is None:
        collection_chosen = []

    query = (
        "EXEC POST_GET_MAP "
        f"@UID='{uid}', "
        f"@COLLECTIONS_CHOSEN='{json.dumps(collection_chosen)}'"
    )

    posts = SQL_MANAGER.select_query( query)

    results = []

    for pp in posts:
        if checkAREA(
            pp["VISIBILITY_AREA_KM"],
            pp["LATITUDE"],
            pp["LONGITUDE"],
            current_position.latitude,
            current_position.longitude,
        ):
            results.append(pp)

    return results


# ------------------------
# DELETE POST

async def post_delete(postid: int, password: str):
    writeLog(
        f"Requested deletion for: {postid} = with pas[10]{password[:10]}"
    )
    query = (
        "EXEC POST_DELETE "
        f"@POSTID={postid}, "
        f"@PASSWORD='{password}'"
    )

    return SQL_MANAGER.insert_query(query)


## INTEREST 

async def profile_interest_merge(uid:int,interests:dict):
    interests_dicts = [interest.dict() for interest in interests]
    dummy = json.dumps(interests_dicts).replace("'", "''")
    query = f"EXEC dbo.PROFILE_INTEREST_MERGE @UID={uid},@JSON='{dummy}'"
    print(query)
    return SQL_MANAGER.select_query(query)

async def profile_interest_get(uid:int):
    query = f"EXEC DBO.PROFILE_INTEREST_GET @UID={uid}"
    return SQL_MANAGER.select_query(query)