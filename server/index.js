const express = require('express');
const { birds } = require('./router');
let app = express();

app.use('/birds', birds);
app.get('/', (req, res) => {
    console.log('get request...');
    res.send('hello world');
});

app.post('/upload', (req, res) => {
    console.log(req);
    res.json({
        code: 200,
        msg: '成功'
    });
});
app.listen(3000, () => {
    console.log('server start at localhost:8080');
})