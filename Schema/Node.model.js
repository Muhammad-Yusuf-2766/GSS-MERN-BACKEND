const mongoose = require('mongoose')

const nodeSchema = new mongoose.Schema({
	doorNum: {
		type: Number,
		required: true,
		index: { unique: true, sparse: true }, // This already creates the unique index
	},
	doorChk: {
		type: Number,
		required: false,
		default: 0,
	},
	betChk: {
		type: Number,
		required: false,
		default: 0,
	},
	product_status: {
		type: Boolean,
		required: false,
		default: true, // true means available
	},
	position: {
		type: String,
		default: '',
	},
})

// No need to add this line as it's already defined above
// nodeSchema.index({ doorNum: 1 }, { unique: true });

const Node = mongoose.model('Node', nodeSchema)
module.exports = Node // Export the model instance, not the schema
