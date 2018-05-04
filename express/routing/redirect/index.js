var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
    res.redirect('/website');
});

app.post('/', (req, res) => {
    res.redirect('/');
});

app.post('/website', (req, res) => {
    res.send('website...');
});

app.get('/website', (req, res) => {
    res.send('hello, this is our website.');
});

app.get('/baidu', (req, res) => {
    res.redirect('http://www.baidu.com');
});

app.get('/download/file', (req, res) => {
    // res.download('../routing.md', 'readme.md');
    res.download('../WechatIMG63122.png');
})

app.listen(3000)