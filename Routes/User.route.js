const express = require('express')
const user_router = express.Router()
const userController = require('../Controllers/User_contr')
const authMiddleware = require('../middlewares/auth.middleware')
const mqttController = require('../Controllers/Subscribe_contr')

/********************************
 *          REST API            *
 ********************************/

// User routs

user_router.post('/signup', userController.signUp)
user_router.post('/login', userController.login)
user_router.get('/logout', userController.logout)
// user_router.get('/refresh', userController.refreshToken)
// user_router.post('/check-self', userController.checkSessions)
user_router.get('/get-users', userController.getUser)
user_router.post('/make-client', userController.makeClient)
user_router.post('/make-user', userController.makeUser)
// user_router.get('/gateways/boss', mqttController.subscribeBoss)
// user_router.get('/gateways/worker', mqttController.subscribeWorker)

module.exports = user_router
