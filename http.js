const fs = require("fs")
const http = require("http")

var mimeTypes = require("./mimeTypes.json") // Mime Type
var nfHTML = "404.html"; //Not Found HTML File

function getLastTextNum(text, symbol) {
    var num = 0;
    var curNum = 0;
    for (let a = 0; a < text.length; ++a) {
        if (text[a] == symbol) ++num, curNum = 0;
        else ++num, ++curNum;
    }
    return num - curNum;
}

function removeDuplicate(text, symbol) {
    var alreadyUsed = false
    var result = ""
    for (let a = 0; a < text.length; ++a) {
        if (text[a] == symbol) {
            if (!alreadyUsed) alreadyUsed = true, result += text[a]
        } else alreadyUsed = false, result += text[a]
    }
    return result;
}

http.createServer(function(req, res) {
    if (!req.url) req.url = "index.html"
    req.url = removeDuplicate(req.url, "/").replace("/", "").replace(/%20/g, " ") // Fix url already use /, Example = http://127.0.0.1////nameFolder/nameFile.html
    if (req.url[req.url.length - 1] == '/') req.url = req.url + "index.html" // Auto direct index.html, Example = http://127.0.0.1/ and it will direct to index.html
    try {
        req.streamFile = fs.readFileSync(req.url)
    } catch (e) {
        if (e.code === "EISDIR") {
            res.writeHead(302, { 'Location': req.url + '/' });
            return res.end();
        } else if (e.code === "ENOENT") {
            if (!fs.existsSync(nfHTML)) {
                res.writeHead(404)
                return res.end()
            }
            req.streamFile = fs.readFileSync(nfHTML)
            res.writeHead(404, { "Content-Type": mimeTypes[nfHTML.slice(getLastTextNum(nfHTML, "."))] || mimeTypes["unkMimeType"] })
            return res.end(req.streamFile)
        }
    }
    res.writeHead(200, { "Content-Type": mimeTypes[req.url.slice(getLastTextNum(req.url, "."))] || mimeTypes["unkMimeType"] })
    return res.end(req.streamFile)
}).listen(80)

console.log("HTTP Server run on port 80!")
