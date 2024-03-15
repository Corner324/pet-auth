import express from 'express';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';
//const { HashPass } = require('./utils/hash_pass');
import path from 'path';
import router from './router.js';
//const session = require("express-session");
import mongoose from 'mongoose';
import { config } from './config.js';
import redisDB from './databases/redisDB.js';
import dotenv from 'dotenv';

import { fileURLToPath } from 'url';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')))
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')))

app.use(bodyParser.json())
app.use(cookieParser())
app.use('/', router)

async function startApp() {
    await mongoose.connect(config.uriMongo)
    return await redisDB.setConnection()
}

startApp()
    .then((redisClient) => {

        app.listen(PORT, () => {
            console.log(`Server running at http://${HOSTNAME}:${PORT}/`)

        })
    })
    .catch((error) => {
        console.error('Error starting the app:', error)
    })

export { redisDB }