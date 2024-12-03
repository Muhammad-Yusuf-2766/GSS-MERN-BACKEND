const assert = require('assert')
const UserSchema = require('../Schema/User.model')
const bcrypt = require('bcryptjs')
const Definer = require('../Lib/errors')
const BaseError = require('../errors/base.error')

class UserService {
	constructor() {
		this.userSchema = UserSchema
	}
	async signupData(data) {
		try {
			const existUser = await this.userSchema.findOne({
				user_email: data.user_email,
			})
			const existNumber = await this.userSchema.findOne({
				user_phone: data.user_phone,
			})

			if (existUser) {
				console.log('EXIST Email:::')
				throw BaseError.UnauthorizedError(
					'User is already registered  with this email'
				)
			} else if (existNumber) {
				console.log('EXIST Phone:::')
				throw BaseError.UnauthorizedError('This phone is already taken')
			}

			const salt = await bcrypt.genSalt()
			data.user_password = await bcrypt.hash(data.user_password, salt)

			const new_user = new this.userSchema(data)
			const result = new_user.save()

			result.user_password = ''
			return result
		} catch (error) {
			throw error
		}
	}

	async loginData(data) {
		const user = await this.userSchema
			.findOne(
				{ user_email: data.user_email },
				{ user_name: 1, user_password: 1 }
			)
			.exec()

		if (!user) {
			throw BaseError.BadRequest(`Not found  user: ${data.user_email}`)
		}
		const isPwTrue = await bcrypt.compare(
			data.user_password,
			user.user_password
		)
		assert.ok(isPwTrue, BaseError.BadRequest('Passwrod is incorrect'))

		return await this.userSchema.findOne({
			user_email: data.user_email,
		})
	}

	async logout(access_token) {
		const token = await TokenService.removeToken(access_token)
		return token
	}

	async getUsers() {
		return this.userSchema.find()
	}

	async makeClientData(id) {
		try {
			const user = await this.userSchema.findByIdAndUpdate(
				{ _id: id },
				{ user_type: 'CLIENT' }, // The update object that sets user_type to "CLIENT"
				{ new: true } // Options: return the updated document
			)
			if (!user) {
				throw new Error('There is no this kind of user :(')
			}

			return user
		} catch (error) {
			throw new Error('There is Error with this user :(')
		}
	}

	async makeUserData(id) {
		try {
			const user = await this.userSchema.findByIdAndUpdate(
				{ _id: id },
				{ user_type: 'USER' }, // The update object that sets user_type to "CLIENT"
				{ new: true } // Options: return the updated document
			)
			if (!user) {
				throw new Error('There is no this kind of CLIENT :(')
			}

			return user
		} catch (error) {
			throw new Error('There is Error with this CLIENT :(')
		}
	}
}

module.exports = UserService
