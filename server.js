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

app.get(/https?:\/\/.+\..+/, function(request, response){
    
/*    var options = {
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
    
    if(url.startsWith("https://")){
        
    }else if(url.startsWith("http://")){
        
    }else{
        
    }
    
    http.get(options, function(){
        //Figure out how to check if something is a real link after
        //I've handled the database.
    });
    */
    
    var qUrl = request.url.slice(1);
    
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
        db.collection("links").createIndex({url: 1, index: 1});
        db.collection("links").find().toArray(function(err, all){
            db.collection("links").find({url: qUrl}).toArray(function(err, result){
                if(err) throw err;
                if(result.length == 0){
                    var newEntry = {
                        url: qUrl,
                        index: = all.length;
                    };
                }else if(result.length == 1){
                    
                }else{
                    throw new Error("Multiple entries of link " + qUrl + " !");
                }
            });
        });
    });
    response.end(request.url + " URL");
});

app.get(/\/\d+/, function(request, response){
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
    });
    response.end(request.url + " NUMBAHS");
});

/*
MongoClient.connect(dburl, function(err, db){
   if(err) throw err; 
});
*/