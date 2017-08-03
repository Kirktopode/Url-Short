var MongoClient = require('mongodb').MongoClient;
var path = require('path');
var express = require('express');
var app = express();
var dburl = "mongodb://localhost:27017/urldb";

function randomString(len){
    var chars = "abcdefghijklmnopqrstuvwxyzABCDE" + 
    "FGHIJKLMNOPQRSTUVWXYZ0123456789";
    var str = "";
    for(var i = 0; i < len; i++){
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}

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

app.get(/\/new\/https?:\/\/.+\..+/, function(request, response){
    
    
    var qUrl = request.url.slice(5);
    
    console.log("GET request for " + request.url);
    
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
        db.collection("urls").createIndex({urlShort: 1});
        db.collection("urls").findOne({urlShort: qUrl}, function(err, result){
            if(err) throw err;
            if(result === null){
                var newEntry = {
                    urlOriginal: qUrl,
                    urlShort: request.baseUrl + randomString(6)
                };
                db.collection("urls").findOne({urlShort:newEntry.urlShort}, function(err, result){
                    if(err) throw err;
                    if(result === null){
                        db.collection("urls").insertOne(newEntry, function(err, result){
                            if(err) throw err;
                            console.log("New Entry: " + newEntry);
                            response.end(result);
                            db.close();
                        })
                    }else{
                        result.urlOriginal = newEntry.urlOriginal;
                        response.end(result);
                        db.close();
                    }
                });
            }else{
                response.end(result);
                db.close();
            }
        });
    });
});

app.get(/\/\w+/, function(request, response){
    
    var q = request.baseUrl + request.url;
    console.log("GET request for " + request.url);
    
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
        db.collection("urls").findOne({urlShort: q}, function(err, result){
            if(err) throw err;
            if(result === null){
                response.end(q + " not found in database.");
            }else{
                response.redirect(response.urlOriginal);
            }
        });
    });
});

/*
MongoClient.connect(dburl, function(err, db){
   if(err) throw err; 
});
*/