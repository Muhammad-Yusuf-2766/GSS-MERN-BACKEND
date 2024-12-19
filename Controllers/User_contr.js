const assert = require('assert')
const UserService = require('../Service/User.service')
const jwt = require('jsonwebtoken')
const path = require('path')

let userController = module.exports

userController.signUp = async (req, res, next) => {
	try {
		console.log('POST: contr.User-signup')
		const data = req.body
		const userService = new UserService()
		const new_user = await userService.signupData(data)

		// JWT related logic
		const token = userController.createToken(new_user)
		res.cookie('access_token', token, {
			maxAge: 10 * 24 * 3600 * 1000,
			httpOnly: false,
		})

		res.status(200).json({ state: 'Success', data: new_user })
	} catch (error) {
		console.log('Error', error.message)
		res.json({ state: 'Fail', message: error.message })
	}
}

userController.login = async (req, res, next) => {
	try {
		console.log('POST: contr.User-Login')
		const data = req.body
		console.log(data)
		const userService = new UserService()
		const user = await userService.loginData(data)
		console.log('USER INCOMING DATA:', user)
		// JWT related logic
		const token = userController.createToken(user)
		res.cookie('access_token', token, {
			maxAge: 10 * 24 * 3600 * 1000,
			httpOnly: false,
			// sameSite: 'None', // Cookie'ni cross-site so'rovlarida saqlash
			// secure: false, // faqat https da cookie ni saqlaydi,
			// sameSite: 'None',
			// path: '/', // barcha endpointlar uchun
		})

		return res.status(200).json({ state: 'Success', data: user, token: token })
	} catch (error) {
		console.log('ERROR: contr.User-Login', error)
		res.json({ state: 'Fail', message: error.message })
	}
}

userController.logout = async (req, res, next) => {
	console.log('POST: contr.User-Logout')
	res.clearCookie('access_token')
	return res.json({ state: 'success' })
}

userController.getUser = async (req, res, next) => {
	try {
		console.log('POST: contr.User-getUser')
		const userService = new UserService()
		const data = await userService.getUsers()
		res.json(data)
	} catch (error) {
		console.log('ERROR: contr.User: getUser', error)
		res.json({ state: 'fail', message: error.message })
	}
}

userController.makeClient = async (req, res) => {
	try {
		console.log('POST: contr.User: Make-Client', req.body)
		const { user_id } = req.body
		console.log(user_id)
		const userService = new UserService()
		const data = await userService.makeClientData(user_id)
		console.log('Changed user', data)
		res.json({ User: user_id })
	} catch (error) {
		console.log('ERROR: contr.User: Make-Client', error)
		res.json({ state: 'fail', message: error.message })
	}
}

userController.makeUser = async (req, res) => {
	try {
		console.log('POST: contr.User: Make-User', req.body)
		const { user_id } = req.body
		const userService = new UserService()
		const data = await userService.makeUserData(user_id)
		res.json({ User: data })
	} catch (error) {
		console.log('ERROR: contr.User: Make-User', error)
		res.json({ state: 'fail', message: error.message })
	}
}

userController.resetPwResquest = async (req, res) => {
	try {
		console.log('POST: contr.User: resetPwResquest', req.body)
		const { user_email } = req.body
		const userService = new UserService()
		const result = await userService.resetPwResquest(user_email)
		return res
			.status(200)
			.json({ state: result.state, message: result.message })
	} catch (error) {
		console.log('ERROR: contr.User: resetPwResquest', error)
		res.json({ state: 'fail', message: error.message })
	}
}
userController.resetPwVerify = async (req, res) => {
	try {
		console.log('POST: contr.User: resetPwVerify', req.body)
		const { user_email, otp, new_password } = req.body
		const userService = new UserService()
		const result = await userService.resetPwVerify(
			user_email,
			otp,
			new_password
		)
		return res
			.status(200)
			.json({ state: result.state, message: result.message })
	} catch (error) {
		console.log('ERROR: contr.User: resetPwResquest', error)
		res.json({ state: 'fail', message: error.message })
	}
}

// ======   Session related  ======== //

// userController.checkSessions = (req, res) => {
// 	console.log('POST: contr.User-check-self')
// 	if (req.session?.user) {
// 		res.json({ state: 'success', data: req.session.user })
// 	} else {
// 		res.json({ state: 'Fail', message: 'You are not authenticated' })
// 	}
// }

// userController.validateAuthUser = (req, res, next) => {
// 	if (req.session?.user?.user_type === 'USER') {
// 		req.user = req.session.user
// 		console.log('Validated:::', req.user)
// 		next()
// 	} else
// 		res.json({
// 			state: 'Fail',
// 			message: 'Only Authenticated Users with User type',
// 		})
// }

// ======== JWT related Mehtod ======== //

userController.createToken = user => {
	try {
		const upload_data = {
			_id: user._id,
			user_name: user.user_name,
			user_email: user.user_email,
			user_title: user.user_title,
			user_type: user.user_type,
		}

		const token = jwt.sign(upload_data, process.env.ACCESS_SECRET_KEY, {
			expiresIn: '10d',
		})

		assert.ok(token, 'There is no any Token Key :(')
		return token
	} catch (error) {
		throw error
	}
}
