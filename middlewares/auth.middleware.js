const UserService = require('../Service/User.service')
const jwt = require('jsonwebtoken')

const retrieveAdminUser = async (req, res, next) => {
	try {
		console.log('retrieve-ADMIN')
		const token = req.cookies['access_token']
		const userService = new UserService()
		const jwtUser = jwt.verify(token, process.env.ACCESS_SECRET_KEY)
		const result = await userService.retrieveAdmin(jwtUser)
		if (result.state === 'fail') {
			return res
				.status(403)
				.json({ state: result.state, message: result.message })
		}

		req.user = result.data
		next()
	} catch (err) {
		console.log(`ERROR, cont/retrieveAuthMember, ${err}`)
		res.status(401).json({ state: 'fail', message: 'Invalid or expired token' })
	}
}

const retrieveClientUser = async (req, res, next) => {
	try {
		const token = req.cookies['access_token']
		const userService = new UserService()
		const jwtUser = jwt.verify(token, process.env.ACCESS_SECRET_KEY)
		const result = await userService.retrieveClient(jwtUser)
		if (result.state === 'fail') {
			return res
				.status(403)
				.json({ state: result.state, message: result.message })
		}

		req.user = result.data
		next()
	} catch (err) {
		console.log(`ERROR, cont/retrieveAuthMember, ${err}`)
		res.status(401).json({ state: 'fail', message: 'Invalid or expired token' })
	}
}

module.exports = {
	retrieveAdminUser,
	retrieveClientUser,
}
