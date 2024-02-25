const Router = require('express');
const router = new Router();
const controller = require('./controller');

router.get('/', controller.getLogin)

router.post('/', controller.login)

router.get('/registration', controller.getRegistration)

router.post('/registration', controller.registration)

router.get('/apanel', controller.getApanel)

router.get('/clearCookie', controller.clearCookie)


module.exports = router;
