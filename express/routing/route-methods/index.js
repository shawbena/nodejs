var express = require('express');
var app = express();

// Get method route
app.get('/', (req, res) => {
    res.send('GET request to homepage');
});

// POST method route
app.post('/', (req, res) => {
    console.log('get post request');
    res.send('POST request to the homepage');
});

app.listen(3000);