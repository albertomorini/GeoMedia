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
    dummy = json.dumps(post_content)

    query = """
    EXEC dbo.POST_MERGE
        @POST_CONTENT=%s
    """

    return SQL_MANAGER.select_query(query, (dummy))


async def collection_merge(collection: dict):
    dummy = json.dumps(collection)

    query = """
    EXEC dbo.COLLECTION_MERGE
        @JSON=%s
    """

    return SQL_MANAGER.select_query(query, (dummy,))

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

        query = """
            EXEC HPMEDIA_MERGEFILE
            @FILESNAME_ATTACHED=%s,
            @POSTID=%s
        """

        return SQL_MANAGER.select_query(query, (json_str, postid))

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
        print(query_results)

        email = body.get("EMAIL")
        username = body.get("USERNAME")

        if query_results.get("EMAIL") and query_results.get("USERNAME"):
            email = query_results["EMAIL"]
            username = query_results["USERNAME"]

        if query_results.get("AUTH") == 2:
            # print("SENDING EMAIL")
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

# Haversine formula implementation
# Compute the geodesic distance between two geographic coordinates
# using Vincenty's inverse formula.

# Args:
#     areaKM (float): The range within the post would be visible
#     post_lat (float): Latitude of the post.
#     post_lon (float): Longitude of the post.
#     curr_lat (float): Current latitude coordinate of the user.
#     curr_lon (float): Current longitude coordinate of the user.

# Returns:
#     bool: True if the user position is included within the area of visibility of the post.

def check_post_area(areaKM, post_lat, post_lon, curr_lat, curr_lon):
    from math import cos, asin, sqrt, pi

    post_lat = float(post_lat)
    post_lon = float(post_lon)
    curr_lat = float(curr_lat)
    curr_lon = float(curr_lon)


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

    query = """
    EXEC POST_GET_MAP
        @UID=%s,
        @COLLECTIONS_CHOSEN=%s
    """

    posts = SQL_MANAGER.select_query(
        query,
        (uid, json.dumps(collection_chosen))
    )

    results = []

    for pp in posts:
        if check_post_area(
            pp["VISIBILITY_AREA_KM"],
            pp["LATITUDE"],
            pp["LONGITUDE"],
            current_position.latitude,
            current_position.longitude,
        ):
            results.append(pp)

    return results

async def profile_show_allowed_post(uid, profile_id, curr_lat, curr_lon):
    query = """
    EXEC PROFILE_GET_ALLOWEDPOST
        @UID=%s,
        @PROFILE_ID=%s
    """

    posts = SQL_MANAGER.select_query(query, (uid, profile_id))

    results = []

    # Filter by visibility
    for pp in posts:
        if check_post_area(
            pp["VISIBILITY_AREA_KM"],
            pp["LATITUDE"],
            pp["LONGITUDE"],
            curr_lat,
            curr_lon,
        ):
            results.append(pp)

    return results


async def collections_get_local(uid,curr_lat,curr_lon):
    query = """
    EXEC POST_GETALL_ALLOWED
    @UID=%s
    """
    posts = SQL_MANAGER.select_query(query, (uid))
    results = []
    ## filter by allowed by visibility
    for pp in posts:
        if check_post_area(
            pp["VISIBILITY_AREA_KM"],
            pp["LATITUDE"],
            pp["LONGITUDE"],
            curr_lat,
            curr_lon
        ):
            results.append(pp)

    collection_rank = dict()
    for p in results:
        c = p["COLLECTION_ID"]
        if(c not in collection_rank):
            collection_rank[c] = 1
        else:
            collection_rank[c] += 1

    
    collection_ids = [
        k for k, v in sorted(
            collection_rank.items(),
            key=lambda item: item[1],
            reverse=True
        )[:10]
    ]
    id_collections = ", ".join(map(str, collection_ids))

    query = f"SELECT * FROM COLLECTIONS WHERE ID IN ({id_collections})"
    return SQL_MANAGER.select_query(query)

# ------------------------
# DELETE POST

async def post_delete(postid: int, password: str):
    writeLog(
        f"Requested deletion for: {postid} = with pas[10]{password[:10]}"
    )
    # Perpared statement to avoid SQL INJECTION
    query = """
    EXEC POST_DELETE
        @POSTID=%s,
        @PASSWORD=%s
    """

    return SQL_MANAGER.insert_query(query, (postid, password))


## INTEREST 

async def profile_interest_merge(uid: int, interests: dict):
    interests_dicts = [interest.dict() for interest in interests]
    dummy = json.dumps(interests_dicts)

    query = """
    EXEC dbo.PROFILE_INTEREST_MERGE
        @UID=%s,
        @JSON=%s
    """

    return SQL_MANAGER.select_query(query, (uid, dummy))

async def profile_interest_get(uid: int):
    query = """
    EXEC dbo.PROFILE_INTEREST_GET
        @UID=%s
    """
    return SQL_MANAGER.select_query(query, (uid,))

async def collections_by_tag(uid: int):
    query = """
    EXEC dbo.COLLECTIONS_BY_TAG
        @UID=%s
    """
    return SQL_MANAGER.select_query(query, (uid,))