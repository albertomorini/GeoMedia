// associate to each sotred procedure/query a function, thus to better encapsulate and isolate the functionality

const SQL_MANAGER = require("./SQL_MANAGER");
////////////////////////////////////////////


function doLogin(username, password, newuser) {
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC DoLogin @USERNAME='" + username + "', @PASSWORD='" + password + "'"+", @NEWUSER="+newuser)
}

function newPost(author,postcontent){
    let dummy_pc = JSON.stringify(postcontent)
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC NEWPOST @AUTHOR='"+author+"', @POSTCONTENT='"+dummy_pc+"'")
}

function getPosts(latitude=null,longitude=null,username=null){
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC GETPOSTS @LATITUDE= "+latitude+", @LONGITUDE="+longitude+",@USERNAME='"+username+"'")
}

function deletePost(postid,username,password){ //TODO: to put in secure mode (with user auth and https..) -- NOT IN THIS DEMO/PROJECT
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC DELETEPOST @POSTID="+postid+", @USER='"+username+"', @PASSWORD='"+password+"'")
}

module.exports = {
    doLogin
    ,newPost
    , getPosts
    , deletePost
}