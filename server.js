// Module that just create the HTTP Serve and call the methods exposed by dispatcher to retrieve/storea data to database

const http = require("http");
// const dispatcher = require("./dispatcher");
const port = 8765
const fs = require("fs")


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


function handleRequest() {
    try {
        let dummy_res = null
        switch (req.url) {
            case "/doLogin": //LOGIN OR REGISTER
                dummy_res = { "yess": "aaa" }
                // dispatcher.doLogin(body.username, body.password, body.newuser).then(resQuery => {
                //     sendResponse(res, 200, resQuery)
                // }).catch(err => {
                //     sendResponse(res, 500, err)
                // })
                break;
            case "/newPost":
                dummy_res = dispatcher.newPost(body.author, body.postcontent)
                break
            case "/getPosts":
                dummy_res = dispatcher.getPosts(body?.latitude, body?.longitude, body?.USERNAME)
                break
            case "/getMediaPost":
                dummy_res = dispatcher.getMediaPost(body?.POSTID)
                break
            case "/deletePost":
                dummy_res = dispatcher.deletePost(body?.POSTID, body?.USERNAME, body?.PASSWORD)
                break
            default:
                sendResponse(res, 404, { 'msg': "Unknown path:" + req.url })
                break;
        }
        return dummy_res;
    } catch (error) {
        //TODO: loggare
        sendResponse(res, 500, { "Error": error })
        return null
    }
}

http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk
    });

    req.on("end", async () => {
        try {
            body = JSON.parse(body)
        } catch (error) {
            console.log(error);

            //nthg
        }

        console.log(body);
        

        if (req.url == "/checkConnection") { // uitility, client on startup send this request, to make sure its configuratin is correct. If server responds the configuration is right
            sendResponse(res, 200, { "HELLO": "From server!" })
        }

        try {
            let dummy_res = await handleRequest
            if (res != null) { //TODO: testare il catch
                sendResponse(res, 200, dummy_res)
            }

        } catch (error) {
            fs.appendFileSync('./log.txt', 'ERROR ,' + Date.now() + ',' + error)
        }

    })
}).listen(port);

console.log("Server started on port: " + port);