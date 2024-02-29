const Router = require('express');
const router = new Router();
const controller = require('./controller');
const { body } = require('express-validator')

router.get('/', controller.getLogin)

router.post('/', 
    body('username').notEmpty().isString().isLength({min: 3, max: 10}),
    body('password').notEmpty().isString().isLength({min: 3, max: 10}),
    controller.login)

router.get('/registration', controller.getRegistration)

router.post('/registration',
    body('username').notEmpty().isString().isLength({min: 3, max: 10}),
    body('password').notEmpty().isString().isLength({min: 3, max: 10}),
    controller.registration)

router.get('/apanel', controller.getApanel)

router.get('/clearCookie', controller.clearCookie)


module.exports = router;
