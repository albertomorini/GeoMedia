// Module that just create the HTTP Serve and call the methods exposed by dispatcher to retrieve/storea data to database

const http = require("http");
const dispatcher = require("./dispatcher");
const port = 9910
const fs = require("fs")
const config = JSON.parse(fs.readFileSync("./config.json"))

const SHARED_KEY = config.SHARED_KEY
const PATH_UPLOADS = config.FOLDERS.UPLOADS

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
 * link the URI path of the HTTP REST server to the execution of query or opportuned method logic applied in the dispatcher classF
 * @param {object} res  response handler to HTTP request
 * @param {string} path req.url requested
 * @param {object} body body of the request
 * @param {string} contentType request content-type if available
 * @returns {Promise} null if already satisfied, otherwise the result set from query execution 
 */
async function dispatchReq(res, path, body, contentType) {
    console.log(path, body);

    let dummy_res = Promise.resolve(null);
    try {
        switch (path) {
            case "/checkConnection": // uitility, client on startup send this request, to make sure its configuratin is correct. If server responds the configuration is right
                sendResponse(res, 200, { "HELLO": "From server!" })
                break;
            case "/auth_login":
            case "/auth_signin": //TODO: extract to incapsulate mail sending
            case "/auth_password_forgot":
            case "/auth_password_reset":
            case "/profile_editinfo":
            case "/profile_getpfp":
                dummy_res = dispatcher.generic_query(path, body)
                break;
            /// POST SPECIFIC
            case "/post_merge": //creation, update

                console.log(">>", body);

                let query_results = await dispatcher.merge_post(body.postdata)
                if(!query_results[0].OK){
                    //TODO return error
                    sendResponse(res,500,{"OK":false,"MSG":query_results[1].MSG})
                    return null
                }
                let post_id = query_results[0].ID

                let files = body.postdata.attachments;
                let x = dispatcher.hpmedia_merge_folder(post_id, files)
                if (x) {
                    sendResponse(res, 200, { "post_id": post_id, "OK": true })
                } else {
                    sendResponse(res, 200, { "post_id": post_id, "OK": false })
                }


                break;
            case "/post_delete": //TODO: put in the generics?
                console.log("postid, userpsw to authorization, into a JSON... generics?");

                //TODO: creare tabella segnalazioni
                break;
            default:
                sendResponse(res, 404, { 'msg': "Unknown path:" + path })
                break;
        }
        return dummy_res
    } catch (error) {
        fs.appendFileSync('./log.txt', 'ERROR ,' + Date.now() + ',' + error + "/n")
        console.log("Error on dispatchReq: ", error);
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
                    fs.appendFileSync('./log.txt', 'ERROR_ENDPOINT' + ',' + Date.now() + ',' + error + "/n")
                    if (error != null) {
                        sendResponse(res, 500, { "Internal_Server_Error": error })
                    }
                })
            } catch (error) {
                sendResponse(res, 500, { "Internal_Server_Error": error })
                fs.appendFileSync('./log.txt', 'ERROR ,' + Date.now() + ',' + error + "/n")
            }
        }
    })
}).listen(port);
console.log("Server started on port: " + port);