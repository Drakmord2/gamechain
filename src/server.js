//
// GameChain
//

const dotenv    = require('dotenv').config();
const cors      = require('./cors');
const business  = require('./business');
const express   = require("express");
const app       = express();

app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, cache-control");
    next();
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});

app.route('/transacao')
    .post(cors.cors, business.transaction);
