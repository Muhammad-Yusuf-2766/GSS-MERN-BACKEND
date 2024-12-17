const express = require('express')
const user_router = express.Router()
const userController = require('../Controllers/User_contr')
const { retrieveAdminUser } = require('../middlewares/auth.middleware')

/********************************
 *          REST API            *
 ********************************/

// User routs

user_router.post('/signup', userController.signUp)
user_router.post('/login', userController.login)
user_router.get('/logout', userController.logout)
// user_router.get('/refresh', userController.refreshToken)
// user_router.post('/check-self', userController.checkSessions)
user_router.get('/get-users', retrieveAdminUser, userController.getUser)
user_router.post('/make-client', retrieveAdminUser, userController.makeClient)
user_router.post('/make-user', retrieveAdminUser, userController.makeUser)
// user_router.get('/gateways/boss', mqttController.subscribeBoss)
// user_router.get('/gateways/worker', mqttController.subscribeWorker)

user_router.post('/reset-password/request', userController.resetPwResquest)
user_router.post('/reset-password/verify', userController.resetPwVerify)

module.exports = user_router
