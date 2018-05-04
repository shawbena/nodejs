const http = require('http');
const express = require('express');
const axios = require('axios');

// http.get({
//     host: 'localhost',
//     port: 8080
// }, (req) => {
//     console.log(req.headers);
// });
axios.get('http://localhost:8080').then((res) => {
    if(res.status != 200 && res.status != 304){
        throw new Error(res.statusText);
    }
    console.log(res.headers['content-type']); // text/html; charset=utf-8
    console.log(res.data); // hello world
});