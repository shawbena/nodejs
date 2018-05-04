// const http = require('http');

// const req = http.request({
//     host: 'localhost',
//     method: 'POST',
//     url: '/secret',
//     port: 3000
// }, (res) => {
//     console.log('get response from "/secret');
//     console.log(res);
// });

// req.end();

var axios = require('axios');

axios({
    method: 'post',
    url: 'http://localhost:3000/'
}).then((res) => {
    console.log(res.data);
});