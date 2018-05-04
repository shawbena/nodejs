var axios = require('axios');

axios({
    method: 'post',
    url: 'http://localhost:3000'
}).then((res) => {
    console.log(res.data);
});