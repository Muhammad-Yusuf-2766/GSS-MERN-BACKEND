const mongoose = require('mongoose')

const clientSchema = new mongoose.Schema({
	company: {
		type: String,
		required: true,
	},
	company_addr: {
		type: String,
		required: true,
	},
	buildings: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Building',
			required: true,
		},
	],
	boss_users: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
	],
	status: {
		type: Boolean,
		required: false,
		default: true,
	},
})

const Client = mongoose.model('Client', clientSchema)
module.exports = Client
