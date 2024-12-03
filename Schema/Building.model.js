const mongoose = require('mongoose')

const buildingSchema = new mongoose.Schema({
	building_name: {
		type: String,
		required: true,
		trim: true,
	},
	building_num: {
		type: Number,
		required: true,
	},
	building_addr: {
		type: String,
		required: true,
	},
	gateway_sets: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'Gateway',
			required: true,
		},
	],
	users: [
		{
			type: mongoose.Schema.ObjectId,
			ref: 'User',
			required: true,
		},
	],
	permit_date: {
		type: String,
		default: new Date(),
	},
	expiration_date: {
		type: String,
		default: new Date(),
	},
	building_sts: {
		type: Boolean,
		required: false,
		default: true,
	},
})

// ===  Bu qator bitta documentda quyidagi keylarning valulari bir xil bo'lmasligi uchun. shu 3 ta keyning value lari oldin kiritilgan va yana bir xil value lar kiritlib saqlansa xatolik beradi.
buildingSchema.index(
	{ building_name: 1, building_num: 1, building_addr: 1 },
	{ unique: true }
)

const Building = mongoose.model('Building', buildingSchema)
module.exports = Building
