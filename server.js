var http = require("http");
var https = require("https");
var fs = require("fs");
var ws = require("ws");
var path = require("path");
var URL = require("url");
var fakeIO = require("./fakeio-server.js");
var hosts = {};
var tempNumberIdThing = 0;
function setNoCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  /*res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );*/
}
function runStaticStuff(req, res, forceStatus) {
  var url = URL.parse(req.url);
  var pathname = url.pathname;

  setNoCorsHeaders(res);

  var file = path.join("./static/", pathname);
  if (pathname == "/") {
    file = "static/index.html";
  }
  if (file.split(".").length < 2) {
    file += ".html";
  }

  if (!fs.existsSync(file)) {
    file = "errors/404.html";
    res.statusCode = 404;
  }

  if (typeof forceStatus !== "undefined") {
    file = "errors/" + forceStatus + ".html";
    res.statusCode = forceStatus;
  }

  fs.createReadStream(file).pipe(res);
}
function waitForBody(req) {
  return new Promise((accept, reject) => {
    var data = [];
    req.on("data", (chunk) => {
      data.push(chunk);
    });
    req.on("end", () => {
      accept(Buffer.concat(data));
    });
    req.on("error", () => {
      reject();
    });
  });
}
function createRandomCharsString(length) {
  var keys = "ABCDEFGHIJKLKMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890";
  var key = "";
  var i = 0;
  while (i < length) {
    key += keys[Math.round(Math.random() * (keys.length - 1))];
    i += 1;
  }
  return key;
}
var savedPolls = {};
const server = http.createServer(async function (req, res) {
  var url = decodeURIComponent(req.url);
  var urlsplit = url.split("/");

  setNoCorsHeaders(res);
  if (urlsplit[1] == "wake") {
    res.end("");
    return;
  }
  
  console.log(urlsplit,req.method);
  
  if (urlsplit[1] == "newpoll" && req.method == "POST") {
    (async function () {
      try{
        var body = await waitForBody(req);
        var json = JSON.parse(body.toString());
        
        var id = createRandomCharsString(10);
        
        if (typeof json.question !== "string") {
          res.end("");
          return;
        }
        if (!Array.isArray(json.choices)) {
          res.end("");
          return;
        }
        for (var choice of json.choices) {
          if (typeof choice !== "string") {
            res.end("");
            return;
          }
        }
        var safePoll = {
          question:json.question,
          choices:json.choices,
          votes: {}
        };
        
        savedPolls[id] = safePoll;
        
        res.end(id);
        
      }catch(e){
        console.log("New poll error:",e);
        res.end("");
      }
    })();
    return;
  }
  
  if (urlsplit[1] == "getpoll" && req.method == "GET") {
    if (!urlsplit[2]) {
      res.statusCode = 404;
      res.end("");
      return;
    }
    var id = urlsplit[2];
    if (savedPolls[id]) {
      var poll = savedPolls[id];
      var safePoll = {
        question: poll.question,
        choices: poll.choices,
      };
      res.end(JSON.stringify(safePoll));
    } else {
      res.statusCode = 404;
      res.end("");
    }
    return;
  }
  
  if (urlsplit[1] == "getresults" && req.method == "GET") {
    if (!urlsplit[2]) {
      res.statusCode = 404;
      res.end("");
      return;
    }
    var id = urlsplit[2];
    if (savedPolls[id]) {
      var poll = savedPolls[id];
      var safePoll = {
        question: poll.question,
        choices: poll.choices,
        votes: poll.votes,
      };
      res.end(JSON.stringify(safePoll));
      
      setTimeout(() => {
        savedPolls[id] = undefined;
      },1000*60);
    } else {
      res.statusCode = 404;
      res.end("");
    }
    return;
  }
  if (urlsplit[1] == "pollvote" && req.method == "POST") {
    (async function () {
      try{
        var body = await waitForBody(req);
        var json = JSON.parse(body.toString());
        
        console.log(json,urlsplit);
        
        if (typeof json.index !== "number") {
          res.end("");
          return;
        }
        if (typeof json.username !== "string") {
          res.end("");
          return;
        }
        
        if (!urlsplit[2]) {
          res.statusCode = 404;
          res.end("");
          return;
        }
        var id = urlsplit[2];
        if (savedPolls[id]) {
          var poll = savedPolls[id];
          if (typeof poll.votes[json.index] == "undefined") {
            poll.votes[json.index] = [];
          }
          poll.votes[json.index].push(json.username);
          res.end("");
        } else {
          res.statusCode = 404;
          res.end("");
        }
        
      }catch(e){
        console.log("Vote poll error:",e);
        res.end("");
      }
    })();
    return;
  }

  runStaticStuff(req, res);
});
server.listen(8080);
console.log("Server started!");