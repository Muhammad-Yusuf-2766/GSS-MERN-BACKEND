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

// Middlewares
// const corsOptions = {
// 	origin: 'http://43.203.125.106:3001/', // Specify the exact origin of your frontend app
// 	credentials: true, // Allow cookies and authentication information
// }

app.use(express.json())
app.use(cookieParser())
app.use(cors({ origin: 'http://43.203.125.106:3001', credentials: true }))

const io = new Server(server, {
	cors: {
		origin: 'http://43.203.125.106:3001', // Specify the frontend's URL
		methods: ['GET', 'POST'],
		credentials: true,
	},
})

app.get('/', (req, res) => {
	mongoose
		.connect(
			`mongodb+srv://Muhammad_Yusuf:${process.env.DB_PASSWORD}@papay.qzqt3.mongodb.net/GSS-IOT-MERN?retryWrites=true&w=majority`
		)
		.then(() => res.send('Successfully connted to Mongo-DB'))
		.catch(error => res.status(200).send('MongoDB Atlas connection error:'))
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
				`mongodb+srv://Muhammad_Yusuf:${process.env.DB_PASSWORD}@papay.qzqt3.mongodb.net/GSS-IOT-MERN?retryWrites=true&w=majority`
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
