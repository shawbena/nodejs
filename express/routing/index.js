var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.send('hello world!');
});

app.post('/redirect', (req, res) => {
    res.send('redirect form /');
});
app.get('/download/file', (req, res) => {
    // res.download('../routing.md', 'readme.md');
    res.download('../WechatIMG63122.png');
})

app.listen(3000);