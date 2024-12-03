require('dotenv').config()
const express = require('express')
const http = require('http')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const user_router = require('./Routes/User.route')
const product_router = require('./Routes/Product.route')
const cors = require('cors')
const errorMiddleware = require('./middlewares/error.middleware')
const { Server } = require('socket.io')
const { setupSocket } = require('./Service/Socket.service')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
	cors: {
		origin: process.env.REACT_URL,
		methods: ['GET', 'POST'],
		credentials: true,
	},
})

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(
	cors({
		origin: process.env.REACT_URL, // Vite ilovasining URL'si
		credentials: true, // Cookie va boshqa ma'lumotlarni yuborish uchun
	})
)
app.get('/', (req, res) => {
	mongoose
		.connect(
			'mongodb+srv://Muhammad_Yusuf:mnxUWbD9i0DMyEjR@papay.qzqt3.mongodb.net/Papay?retryWrites=true&w=majority&appName=Papay'
		)
		.then(() => res.send('Successfully connted to Mongo-DB'))
		.catch(error => res.send('MongoDB Atlas connection error:', error))
})
app.use('/', user_router)
app.use('/product', product_router)
app.use(errorMiddleware)

setupSocket(io)

const PORT = process.env.PORT || 3000

const startServer = async () => {
	try {
		mongoose
			.connect(
				'mongodb+srv://Muhammad_Yusuf:mnxUWbD9i0DMyEjR@papay.qzqt3.mongodb.net/Papay?retryWrites=true&w=majority&appName=Papay'
			)
			.then(() => console.log('MongoDB Atlas connected successfully'))
			.catch(error => console.error('MongoDB Atlas connection error:', error))

		server.listen(PORT, () => {
			console.log(`Server is running successfully on: http://localhost:${PORT}`)
		})
	} catch (error) {
		console.log(`Error: ${error}`)
	}
}

startServer()
