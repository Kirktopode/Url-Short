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

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", function(request, response){
    response.writeHead(200, {"content-type":"text/html"});
    response.write("<h1>This is my url-shortener!</h1>");
    response.write(`<p>You can send a url to have it shortened. 
    This will return a JSON object with the url and the shortened url.</p>
    <p>New urls to be shortened should be requested in the following format:<br>
    ${request.protocol}://${request.hostname}/new/https://www.example.com</p>
    <p>Responses will be json objects like the following example: <br>
    {urlOriginal: https://www.example.com, urlShort: ${request.protocol}
    ://${request.hostname}/${randomString(6)}}</p>
    <p>Follow the shortened url to be redirected to the original!<p>`);
    response.end();
});

app.get("/*", function(request, response, next){
    next();
});

app.get(/\/new\/https?:\/\/.+\..+/, function(request, response){
    response.writeHead(200, {"content-type":"application/json"});
    
    
    var qUrl = request.url.slice(5);
    
    console.log("GET request for " + request.url);
    
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
        db.collection("urls").createIndex({urlShort: 1});
        db.collection("urls").findOne({urlOriginal: qUrl}, function(err, result){
            if(err) throw err;
            if(result === null){
                
                var urlString = request.protocol + "://" + request.hostname + "/";
                
                var newEntry = {
                    urlOriginal: qUrl,
                    urlShort: urlString + randomString(6)
                };
                db.collection("urls").findOne({urlShort:newEntry.urlShort}, function(err, result){
                    if(err) throw err;
                    if(result === null){
                        db.collection("urls").insertOne(newEntry, function(err, result){
                            if(err) throw err;
                            console.log("New Entry: " + newEntry.urlOriginal + ", " + newEntry.urlShort);
                            response.end(JSON.stringify({
                                urlOriginal: newEntry.urlOriginal, 
                                urlShort: newEntry.urlShort
                            }));
                            //db.close();
                        });
                    }else{
                        result.urlOriginal = newEntry.urlOriginal;
                        response.end(JSON.stringify({
                            urlOriginal: result.urlOriginal, 
                            urlShort: result.urlShort
                        }));
                        //db.close();
                    }
                });
            }else{
                response.end(JSON.stringify({
                        urlOriginal: result.urlOriginal, 
                        urlShort: result.urlShort
                    }));
                //db.close();
            }
        });
    });
});

app.get("/new/*", function(request, response){
    response.writeHead(200, {"content-type":"text/html"});
    response.end(request.query.slice(5) + "isn't registering " + 
    "as a valid URL. Remember to include the leading HTTP:// and" + 
    " to make sure it leads to a valid address.");
});

app.get(/\/\w+/, function(request, response){
    
    var q = request.protocol + "://" + path.join(request.hostname, request.url);
    console.log("GET request for " + request.url);
    
    MongoClient.connect(dburl, function(err, db){
        if(err) throw err;
        db.collection("urls").findOne({urlShort: q}, function(err, result){
            if(err) throw err;
            if(result === null){
                response.writeHead(200, {"content-type":"application/json"});
                response.end(q + " not found in database.");
                //db.close();
            }else{
                //db.close();
                response.redirect(result.urlOriginal);
            }
        });
    });
});

app.get("/new/*", function(request, response){
    response.writeHead(200, {"content-type":"text/html"});
    response.end(request.query.slice(1) + " isn't a valid request! " + 
    "Please visit " + request.hostname + " for usage details.");
});

/*
MongoClient.connect(dburl, function(err, db){
   if(err) throw err; 
});
*/