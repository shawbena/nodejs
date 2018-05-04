var express = require('express');
var birds = express.Router();

// middleware that is specific to this router
birds.use((req, res, next) => {
   console.log('Time: ', Date.now()); 
});

// define the home page route
birds.get('/', (req, res) => {
    res.send('Birds home page');
});

// define the about route
birds.get('/about', (req, res) => {
    res.send('About birds');
});

module.exports = router;