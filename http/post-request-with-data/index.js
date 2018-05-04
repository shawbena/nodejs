const http = require('http');
const qs = require('querystring');

const postData = qs.stringify({
    msg: 'Hello World!'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/upload',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
    }
};
// 发起 post 请求
const req = http.request(options, (res) => {
    console.log(`STATUS: ${JSON.stringify(res.statusCode)}`);
    // STATUS: 200
    console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
    // HEADERS: {"x-powered-by":"Express","content-type":"application/json; charset=utf-8","content-length":"27","etag":"W/\"1b-S/RQzOuCmYT0F6rke2X1Csi+Gqg\"","date":"Fri, 04 May 2018 06:48:38 GMT","connection":"close"}
    res.setEncoding('utf8');
    res.on('data', chunk => {
        console.log(`BODY: ${chunk}`);
        // BODY: {"code":200,"msg":"成功"}
    });
    res.on('end', () => {
        console.log('No more data in response.');
        // No more data in response.
    });
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

// write data to request body
req.write(postData);
req.end();