var MongoClient = require('mongodb').MongoClient;
var http = require('http');
var https = require('https');
var express = require('express');
var app = express();
var dburl = "mongodb://localhost:27017/urldb";

app.listen(8080);
console.log("Listening on port 8080.");

app.get("/", function(request, response){
    response.writeHead(200, {"content-type":"text/html"});
    response.write("<h1>This is my url-shortener!</h1>");
    response.write(`<p>You can send a url to have it shortened. 
    This will return a JSON object with the url and the shortened url.</p>`);
    response.end();
});

app.get("/*", function(request, response, next){
    response.writeHead(200, {"content-type":"application/json"});
    next();
});

app.get(/\/.+\.+/, function(request, response){
    
    var options = {
        host: "",
        path: "/"
    };
    
    var url = request.url.slice(1);
    url = url.split("/");
    options.host = url.reverse().pop();
    url.reverse();
    url.forEach(function(item){
        options.path += item + "/";
    });
    
/*    if(url.startsWith("https://")){
        
    }else if(url.startsWith("http://")){
        
    }else{
        
    }*/
    
    http.get(options, function(){
        //YOU WERK ON DIS
    });
    
  /*  MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
    })*/
    response.end(request.url + " URL");
});

app.get(/\/\d+/, function(request, response){
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
    })
    response.end(request.url + " NUMBAHS");
});

/*
MongoClient.connect(dburl, function(err, db){
   if(err) throw err; 
});
*/