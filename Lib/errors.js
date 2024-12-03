class Definer {
	// === General Errors === //
	static general_err1 = 'att: Something went wrong!'
	static general_err2 = 'att: There is no data with that params!'
	static general_err3 = 'att: File-upload error!!'

	// === Product Errors === //
	static product_err1 = 'att: Product creation is failed!'
	static product_err2 = 'att: No any active nodes!'

	// === Member Auth Errors === //
	static user_err3 = 'att: Your are inserting already used member nick or phone'
	static user_err2 = 'att: No member with that Nickname'
	static user_err1 = 'att: User password is wrong'
}

module.exports = Definer
