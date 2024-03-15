import Router from 'express';
import controller from './controller.js';
import { body } from 'express-validator';

const router = new Router()

router.get('/', controller.getLogin)

router.post(
    '/',
    body('username').notEmpty().isString().isLength({ min: 3, max: 10 }),
    body('password').notEmpty().isString().isLength({ min: 3, max: 10 }),
    controller.login
)

router.get('/registration', controller.getRegistration)

router.post(
    '/registration',
    body('username').notEmpty().isString().isLength({ min: 3, max: 10 }),
    body('password').notEmpty().isString().isLength({ min: 3, max: 10 }),
    controller.registration
)

router.get('/APanel', controller.getApanel)

router.get('/clearCookie', controller.clearCookie)

export default router;
