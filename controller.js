// const bodyParser = require('body-parser')
import HashPass from './utils/hash_pass.js';
import path from 'path';
import { query, validationResult } from 'express-validator';
import crypto from 'crypto';
import session from 'express-session';
// const { secret } = require('./config')
import redisDB from './databases/redisDB.js';
//const redisClient = require('./server')
import User from './models/User.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generate_key = function () {
    return crypto.randomBytes(16).toString('base64')
}

class Controller {
    async getLogin(req, res) {
        if (req.cookies.UserName) {
            const usr_name = req.cookies.UserName
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await redisClient.get(usr_name)

            if (req.cookies.UserData === usr_data) {
                res.sendFile(path.join(__dirname, 'views', 'index_APanel.html'))
            } else {
                res.sendFile(path.join(__dirname, 'views', 'index.html'))
            }
        } else {
            res.sendFile(path.join(__dirname, 'views', 'index.html'))
        }
    }

    async login(req, res) {
        const { username, password } = req.body
        const HashGenerator = new HashPass()
        const error_result = validationResult(req)

        if (!error_result.isEmpty()) {
            return res.status(401).send({ errors: error_result.array() })
        }

        HashGenerator.hashing(password).then(async (hashingPassword) => {
            console.log('hashingPassword: ', hashingPassword)

            const candidate = await User.findOne({ username })

            const correctPassword = HashGenerator.check_pass(
                candidate.get('password'),
                password
            )
            if (!correctPassword) {
                res.status(401).json({
                    message: 'Unauthorized, invalid login or password',
                })
            } else {
                // req.session.cookie()
                res.status(301).json({ url: '/apanel' })
            }
        })
    }

    async getRegistration(req, res) {
        res.sendFile(path.join(__dirname, 'views', 'registration.html'))
    }

    async registration(req, res) {
        const { username, password } = req.body
        const HashGenerator = new HashPass()
        const hashedPassword = await HashGenerator.hashing(password)

        const error_result = validationResult(req)

        if (!error_result.isEmpty()) {
            res.status(401).send({ errors: error_result.array() })
        }

        try {
            const candidate = await User.findOne({ username })
            if (candidate) {
                res.status(400).json({
                    message: 'Account with this login already exist',
                })
            }
            const user = new User({
                username,
                password: hashedPassword,
                roles: 'USER',
            })
            user.save()
            console.log('ДАЕМ КУКИ')
            const generatedCookie = generate_key()
            res.cookie('UserData', generatedCookie, { maxAge: 3600 * 24 * 5 })
            res.cookie('UserName', username, { maxAge: 3600 * 24 * 5 })

            let redisClient = redisDB.getClient()

            // const redisClient = new redisDB()
            // const cliient = await redisClient.setConnection()
            console.log('ALERT!', typeof redisClient);


            console.log(Object.getOwnPropertyNames(redisClient));
            // redisClient.logog()
            await redisClient.getClient.set(username, generatedCookie)

            res.status(300).json({
                url: '/',
                message: 'Account successful created',
            })
        } catch (e) {
            console.log(e)
            res.status(400).json({ message: 'Error with create account! ' + e })
        }
    }

    async getApanel(req, res) {
        const redisClient = new redisDB()
        const cliient = await redisClient.setConnection()
        if (req.cookies.UserName) {
            const usr_name = req.cookies.UserName
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await cliient.get(usr_name)
            if (req.cookies.UserData === usr_data) {
                res.sendFile(path.join(__dirname, 'views', 'panel.html'))
            } else {
                res.status(400).json({ message: 'Error with cookie!' })
            }
        } else {
            res.sendStatus(401)
        }
    }

    async clearCookie(req, res) {
        res.clearCookie('UserData').send({ Error: 'Cookie cleared!', url: '/' })
    }
}

export default new Controller()
