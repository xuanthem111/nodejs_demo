require('dotenv').config()
const express = require('express');
const cors = require('cors');
const mongoDB = require('./src/databases/mongodb/index');
// const shared = require('./src/shared');
var bodyParser = require('body-parser')

const app = express();

app.use(express.json());
app.use(cors());
const server = require('http').createServer(app);


var jsonParser = bodyParser.json()
app.use(jsonParser)
app.use('/', require('./src/routes'));

server.listen('8081', () => {
    console.log("Listening on port 8081");
    mongoDB.connect();
});