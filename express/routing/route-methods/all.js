var express = require('express');
var app = express();

app.all('/secret', function (req, res, next){
    console.log('Accessing the secret section ...');
    next(); // pass control to the next handler
});
app.get('/', (req, res) => {
    res.send('get request from "/"');
});

app.get('/secret', (req, res) => {
    res.send('welcom to secret homepage.');
});

app.post('/secret', (req, res) => {
    res.send('secret message.');
});

app.listen(3000);