const express = require('express');
const bodyParser = require('body-parser');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
//const { HashPass } = require('./utils/hash_pass');
const path = require('path')
const router = require('./router')
//const session = require("express-session");
const mongoose = require('mongoose');
const {uriMongo} = require("./config.js")
const redisDB = require('./databases/redisDB.js')
const dotenv = require('dotenv')


/*
*  TODO:
*   1) Первести все на MongoDB [X]
    2) Рефакторинг x2 []
    3) Что в redisClients у set []
*
* */

dotenv.config()
const PORT = process.env.PORT
const HOSTNAME = process.env.HOSTNAME

const app = express()


app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

app.use(bodyParser.json());
app.use(cookieParser());
app.use("/", router)

async function startApp() {
    await mongoose.connect(uriMongo);
    const redisClient = await redisDB.setConnection();
    return redisClient;
}

startApp().then(redisClient => {
    module.exports.redisClient = redisClient;
    app.listen(PORT, () => {
        console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
    });
}).catch(error => {
    console.error("Error starting the app:", error);
});


