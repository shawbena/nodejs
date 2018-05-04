const http = require('http');

const req = http.request({
    host: 'localhost',
    method: 'POST',
    url: '/',
    port: 3000
}, (res) => {
    console.log('get response from "localhost:3000"');
    console.log(res);
});

req.end();