const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const { DB } = require('./work_db.js');
const { HashPass } = require('./hash_pass.js');
const path = require('path')
const { query, validationResult } = require('express-validator');
const crypto = require('crypto');
const session = require('express-session');
const { secret } = require('./config')
const redisDB = require('./redisDB')



const generate_key = function() {
    return crypto.randomBytes(16).toString('base64');
};

class Controller {

    async getLogin(req, res){
        const client = await redisDB.setConnectrion()
        if(req.cookies.UserName) {
            const usr_name = req.cookies.UserName;
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await client.get(usr_name);
            if(req.cookies.UserData === usr_data){
                res.sendFile( __dirname + '/views/index_APanel.html')
            }
            else{
                res.sendFile( __dirname + '/views/index.html')
            }
        }
        else {
            res.sendFile( __dirname + '/views/index.html')
        }
    }

    async login(req, res){

        let db = new DB('accounts');
        const { username, password } = req.body;
        const HashGenerator = new HashPass();
        const error_result = validationResult(req);

        if (!error_result.isEmpty()) {
            console.log('Ошибка 1')
            return res.status(401).send({ errors: error_result.array() });
        }

        HashGenerator.hashing(password).then((hashingPassword) =>{

            console.log('hashingPassword: ', hashingPassword);
            
            db.querry("SELECT login, password FROM accounts WHERE login=?", [username], async (error, result) => {
                if (error) {
                    console.log('Ошибка 2')
                    console.error('Error! ', error);
                } else if (!result.length) {
                    console.log('Ошибка 3')
                    res.status(401).json({message: "Unauthorized, invalid login"}); // w/o return ?
                    return res.end()

                } else {
                    const correctPassword = HashGenerator.check_pass(hashingPassword, password);
                    if (!correctPassword) {
                        console.log('Ошибка 4')
                        res.status(401).json({message: "Unauthorized, invalid login or password"});
                        return res.end()
                    } else {
                        console.log('Success! ', result);
                        // req.session.cookie()

                        const client = createClient();
                        client.on('error', err => console.log('Redis Client Error', err));
                        await client.connect();

                        await client.set(username, generate_key());
                        const value = await client.get(username);
                        console.log(`Данные из Redis для ${username} -`, value);

                        res.status(301).json({redirectURL: '/apanel'});
                        return res.end()
                    }
                }
            });
            db.closeCon();
        });
    }

    async getRegistration(req, res){
        res.sendFile( __dirname + '/views/registration.html')
    }

    async registration(req, res){
        try {
            let db = await new DB('accounts');
            const {username, password} = req.body;
            const HashGenerator = new HashPass();
            const hashedPassword = await HashGenerator.hashing(password);

            const error_result = validationResult(req);

            debugger;
            console.log(' ОТМЕТКА 1 ')
            if (!error_result.isEmpty()) {
                console.log('ОШИБКА РЕГИСТРАЦИИ ПО ДАННЫМ');
                res.status(401).send({errors: error_result.array()});
                res.end()
            }

            let candidateExist = false;
            console.log(' ОТМЕТКА 2 ')
            await db.querry("SELECT * FROM accounts WHERE login=?", [username], (error, result) => {
                if (error) {
                    console.log('ОШИБКА РЕГИСТРАЦИИ ПО БД');
                    console.error(error);
                    return 0
                } else if (result.length) {
                    console.log('А там уже', result)
                    candidateExist = true;
                    console.log('ТАКОЙ ЛОГИН УЖЕ ЕСТЬ');
                    res.status(400).json({message: "Account with this login already exist"})
                    return res.end()
                }
                else{
                    console.log(' ОТМЕТКА 3 ')
                }
            });
            console.log(' ОТМЕТКА 4 ')
            if (!candidateExist) {
                await db.querry("INSERT INTO accounts(login, password) VALUES(?, ?)", [username, hashedPassword], async (error, result) => {
                    if (error) {
                        console.log('ОШИБКА РЕГИСТРАЦИИ ПО БД 2')
                        console.error(error);
                        return 0
                    } else {
                        console.log('ДАЕМ КУКИ')
                        res.cookie('UserData', generate_key(), {maxAge: 3600 * 24});
                        res.cookie('UserName', username, {maxAge: 3600 * 24});

                        candidateExist = false;
                        await db.closeCon();

                        res.redirect(301, "/")
                        res.send()
                    }
                });
            }
        } catch (error) {
            console.error('ОШИБКА РЕГИСТРАЦИИ ПО БД', error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getApanel(req, res){
        const client = createClient();
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
        if(req.cookies.UserName) {
            const usr_name = req.cookies.UserName;
            console.log('UserName from cookies - ', usr_name)
            const usr_data = await client.get(usr_name);
            if(req.cookies.UserData === usr_data){
                res.sendFile( __dirname + '/views/panel.html')
                res.end()
            }
        }
        else{
            res.sendStatus(401)
            res.end()
        }
    }

    async clearCookie(req, res){
        res.clearCookie('UserData').send({'Error': 'Cookie cleared!', redirectURL: '/' })
    }
}

module.exports = new Controller();