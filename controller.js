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
const User = require("./models/User")



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

        console.log(' ОТМЕТКА 2 ')

        try {
            const candidate = await User.findOne({username})
            if(candidate){
                res.status(400).json({message: "Account with this login already exist"})
            }
            const user = new User({username, password: hashedPassword, roles: 'USER'})
            user.save()
            console.log('ДАЕМ КУКИ')
            res.cookie('UserData', generate_key(), {maxAge: 3600 * 24});
            res.cookie('UserName', username, {maxAge: 3600 * 24});
            res.status(300).json({ url: '/', message: 'Account successful created'})
        }
        catch (e){
            console.log(e)
            res.status(400).json({message: 'Error with create account!'})
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