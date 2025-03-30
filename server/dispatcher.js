const SQL_MANAGER = require("./SQL_MANAGER");
////////////////////////////////////////////


function doLogin(username, password, newuser) {
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(), "EXEC DoLogin @USERNAME='" + username + "', @PASSWORD='" + password + "'"+", @NEWUSER="+newuser)
}

function newPost(author,postcontent){
    let dummy_pc = JSON.stringify(postcontent)
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC NEWPOST @AUTHOR='"+author+"', @POSTCONTENT='"+dummy_pc+"'")
}

function getPosts(latitude=null,longitude=null){
    return SQL_MANAGER.selectQuery(SQL_MANAGER.loadConfig(),"EXEC GETPOSTS @LATITUDE= "+latitude+", @LONGITUDE="+longitude)
}

module.exports = {
    doLogin
    ,newPost
    , getPosts
}