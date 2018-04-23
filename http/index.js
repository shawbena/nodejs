const http = require('http');

http.get({
    host: 'localhost',
    port: 8080
}, (req) => {
    console.log(req.headers);
});