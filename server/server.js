// Module that just create the HTTP Serve and call the methods exposed by geomedia_helper to retrieve/storea data to database

const http = require("http");
const geomedia_helper = require("./geomedia_helper");
const port = 9911
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json"))

const SHARED_KEY = config.SHARED_KEY

/**
 * Invia una risposta HTTP
 * @param {Object} res res of http 
 * @param {int} status of response 
 * @param {Object} body 
 * @param {String} mime 
 */
function sendResponse(res, status, body = null, mime = "application/json") {
    res.writeHead(status, { 'Content-Type': mime, "Access-Control-Allow-Origin": "*" });
    try {
        if (mime == "application/json") {
            res.write(JSON.stringify(body));
        } else {
            res.write(body)
        }
    } catch (err) {
        res.write(err);
    }
    res.end();
}

function checkAuth(key) {
    return key == SHARED_KEY
}

/**
 * link the URI path of the HTTP REST server to the execution of query or opportuned method logic applied in the geomedia_helper classF
 * @param {object} res  response handler to HTTP request
 * @param {string} path req.url requested
 * @param {object} body body of the request
 * @param {string} contentType request content-type if available
 * @returns {Promise} null if already satisfied, otherwise the result set from query execution 
 */
async function dispatchReq(res, path, body, contentType) {

    let dummy_res = Promise.resolve(null);
    let query_results = null;
    try {
        switch (path) {
            case "/checkConnection": // uitility, client on startup send this request, to make sure its configuratin is correct. If server responds the configuration is right
                sendResponse(res, 200, { "HELLO": "From server!" })
                break;
            case "/auth_login":
            case "/auth_psw_reset":
            case "/profile_editinfo":
            case "/profile_getpfp":
            case "/profile_getinfo":
            case "/auth_check_otp":
            case "/interactions_likepost":
            case "/hpmedia_remove":
            case "/collections_get":
            case "/collections_get_fullcollection":
            case "/users_list":
            case "/report_new":
            case "/auth_check_username":
            case "/collection_posts_get":
            case "/post_get_authorid":
                dummy_res = geomedia_helper.generic_query(path, body)
                break;
            ////___________________________________________________________________
            case "/auth_psw_forgotten":
            case "/auth_signin":
                query_results = await geomedia_helper.auth_signin(path, body)
                if (query_results.AUTH == 2) {
                    delete query_results.OTP //do not send the OTP via http, is sent via email (otherwise would be worthless)
                    sendResponse(res, 200, query_results)
                } else {
                    geomedia_helper.writeLog("AUTH failed for: " + JSON.stringify(body), "SIGNIN")
                    sendResponse(res, 401, query_results)
                }
                break;
            case "/post_merge": // POST SPECIFIC -- creation, update
                let files = JSON.parse(JSON.stringify(body.postdata.attachments));

                delete body.postdata.attachments // avoid to pass files to SQL

                query_results = await geomedia_helper.post_merge(body.postdata)
                if (!query_results[0].OK) {
                    sendResponse(res, 500, { "OK": false, "MSG": query_results[1].MSG })
                } else {
                    let post_id = query_results[0].ID
                    let x = geomedia_helper.hpmedia_merge_folder(post_id, files)
                    if (x) {
                        sendResponse(res, 200, { "post_id": post_id, "OK": true })
                    } else {
                        sendResponse(res, 500, { "post_id": post_id, "OK": false })
                    }
                }
                break;
            case "/collection_merge":
                dummy_res = await geomedia_helper.collection_merge(body.collectionData)
                break;
            case "/post_get_map":
                dummy_res = await geomedia_helper.post_get_map(body?.uid, body?.current_position, body?.collection_chosen);
                break;
            case "/post_get_fullpost":
                query_results = await geomedia_helper.generic_query("post_get_fullpost", body)
                let ff = await geomedia_helper.hpmedia_read_folder(body?.postid)
                if (ff == undefined || ff.length == 0) {
                    ff = []
                }
                query_results[0]["attachments"] = ff
                sendResponse(res, 200, query_results)
                break;
            case "/post_delete":
                dummy_res = await dispatchReq.post_delete(body?.postid, body?.password)
                break;
            ////______________________________________________________________________________
            ////______________________________________________________________________________
            default:
                sendResponse(res, 404, { 'msg': "Unknown path:" + path })
                break;
        }
        return dummy_res
    } catch (error) {
        console.error("Error on dispatchReq: ", error);
        geomedia_helper.writeLog(error, "ERROR")
    }
}


//////////////////////////////////////////
http.createServer((req, res) => {
    let body = "";
    const headers = req.headers;
    const contentType = headers["content-type"];
    const authHeader = headers["authorization"];

    req.on("data", (chunk) => {
        body += chunk
    });

    req.on("end", () => {

        let json_body = {}
        try {
            json_body = JSON.parse(body)
            /// always include, let the stored procedure decide if utilize them or not
            json_body.IP = req.socket.remoteAddress
            json_body.HEADERS = headers
        } catch (error) { }

        if (authHeader == null || authHeader == undefined || !checkAuth(authHeader)) {
            sendResponse(res, 401, {
                'auth': 0,
                'msg': "Invalid API key",
                "YourIP": req.socket.remoteAddress,
                "YourHeaders": headers
            })
        } else {
            try {
                dispatchReq(res, req.url, json_body, contentType).then(resQuery => {
                    if (resQuery != null) { //otherwise already handled on the method path
                        sendResponse(res, 200, resQuery)
                    }
                }).catch(error => {
                    geomedia_helper.writeLog(error, "ERROR_ENDPOINT");
                    if (error != null) {
                        sendResponse(res, 500, { "Internal_Server_Error": error })
                    }
                })
            } catch (error) {
                sendResponse(res, 500, { "Internal_Server_Error": error })
                geomedia_helper.writeLog(error)
            }
        }
    })
}).listen(port);
console.log("Server started on port: " + port);