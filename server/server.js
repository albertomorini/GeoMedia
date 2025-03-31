const http = require("http");
const dispatcher = require("./dispatcher");
const port = 9911
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

var x = http.createServer((req, res) => {
    let body = "";
    req.on("data", (chunk) => {
        body += chunk
    });

    req.on("end", () => {
        try {
            body = JSON.parse(body)
        } catch (error) {
            //nthg
        }

        if(req.url=="/checkConnection"){
            sendResponse(res,200,{"HELLO":"From server!"})
        }

        try {
            switch (req.url) {
                case "/doLogin": //LOGIN OR REGISTER
                    dispatcher.doLogin(body.username, body.password, body.newuser).then(resQuery => {
                        sendResponse(res, 200, resQuery)
                    }).catch(err => {
                        sendResponse(res, 500, err)
                    })
                    break;
                case "/newPost":
                    dispatcher.newPost(body.author,body.postcontent).then(resQuery=>{
                        sendResponse(res,200,resQuery)
                    }).catch(err=>{
                        sendResponse(res,500,err)
                    })
                    break
                case "/getPosts":
                    dispatcher.getPosts(body?.LATITUDE, body?.LONGITUDE).then(resQuery=>{
                        sendResponse(res,200,resQuery)
                    }).catch(err=>{
                        sendResponse(res,500,err)
                    })
                    break
                default:
                    sendResponse(res, 404, { 'msg': "Unknown path:" + req.url })
                    break;
            }
        } catch (error) {
            fs.appendFileSync('./log.txt', 'ERROR ,' + Date.now() + ',' + error)
        }

    })
}).listen(port);

console.log("Server started on port: "+port);