const express = require('express');

let app = express();

app.get('/', (req, res) => {
    console.log('get request...');
    res.send('hello world');
});

app.listen(8080, () => {
    console.log('server start at localhost:8080');
})