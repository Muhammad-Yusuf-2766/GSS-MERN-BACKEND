// const mqttClient = require('../Service/Mqtt.service')
// const Client = require('../Schema/Client.model')
// const Building = require('../Schema/Building.model')
// const Gateway = require('../Schema/Gateway.model')
// const Nodes = require('../Schema/Node.model')

// // Declare a variable for io
// let io

// setTimeout(() => {
// 	const { io: socketIo } = require('../Server')
// 	io = socketIo // Assign the imported io to the variable
// }, 1000) // Ensure the server is initialized

// let currentTopics = [] // Track the topics that are currently subscribed to

// let mqttSubscribeController = module.exports

// mqttSubscribeController.subscribeBoss = async (req, res) => {
// 	try {
// 		console.log('GET: User.contr: subscribeBoss')
// 		const { userId } = req.query // Assuming you pass userId as a query parameter
// 		console.log('Request User Id:', userId)

// 		// Find the client associated with this boss user
// 		const client = await Client.findOne({ boss_users: userId })
// 		if (!client) {
// 			return res
// 				.status(404)
// 				.json({ error: 'Client not found for this boss user' })
// 		}

// 		// Get all buildings associated with the client
// 		const buildings = await Building.find({ _id: { $in: client.buildings } })

// 		// Extract all gateway IDs from the buildings
// 		const gatewayIds = buildings.flatMap(building => building.gateway_sets)

// 		// Fetch all gateways from the gateway IDs and populate nodes
// 		const gateways = await Gateway.find({ _id: { $in: gatewayIds } }).populate(
// 			'nodes'
// 		)

// 		// Calculate the total number of nodes across all gateways
// 		const totalNodeCount = gateways.reduce(
// 			(sum, gateway) => sum + gateway.nodes.length,
// 			0
// 		)

// 		if (!gateways || gateways.length === 0) {
// 			return res
// 				.status(404)
// 				.json({ error: 'No gateways found for the associated buildings' })
// 		}

// 		// Unsubscribe from any previous topics
// 		currentTopics.forEach(topic => {
// 			mqttClient.unsubscribe(topic, err => {
// 				if (err) {
// 					console.error(`Unsubscription error from topic ${topic}:`, err)
// 				} else {
// 					console.log(`Unsubscribed from topic: ${topic}`)
// 				}
// 			})
// 		})

// 		// Subscribe to new topics using gateway UUIDs
// 		const newTopics = gateways.map(
// 			gateway =>
// 				`GSSIOT/01030369081/GATE_PUB/GRM22JU22P00${gateway.serial_number}`
// 		)

// 		newTopics.forEach(topic => {
// 			mqttClient.subscribe(topic, err => {
// 				if (!err) {
// 					console.log(`Subscribed to ${topic}`)
// 				} else {
// 					console.error(`Subscription error for topic ${topic}:`, err)
// 				}
// 			})
// 		})

// 		// Update currentTopics to track subscriptions
// 		currentTopics = newTopics

// 		// MQTT message handler for each topic
// 		mqttClient.on('message', (topic, message) => {
// 			const serialNumber = topic.split().pop() // Extract the UUID from the topic
// 			const data = message.toString() // Convert the message buffer to string
// 			console.log(`Mqtt incoming data from: ${topic}, Data: ${data}`)

// 			// Emit the data to the frontend using Socket.IO
// 			io.emit('mqttData', { serialNumber, data })
// 		})

// 		// Return the subscribed UUIDs/topics along with the total node count to the client
// 		return res.json({
// 			success: `Subscribed to topics: ${newTopics.join(', ')}`,
// 			totalNodeCount, // Include the total count of nodes across all gateways
// 		})
// 	} catch (error) {
// 		console.error('Error fetching gateways or subscribing:', error)
// 		return res.status(500).json({ error: 'Server error' })
// 	}
// }

// mqttSubscribeController.subscribeWorker = async (req, res) => {
// 	try {
// 		console.log('GET: User.contr: subscribeWorker')
// 		const { userId } = req.query // Extract userId from query parameters
// 		console.log('Request User Id:', userId)

// 		// Find all buildings where the user is listed in the `users` array
// 		const buildings = await Building.find({ users: userId })

// 		if (!buildings || buildings.length === 0) {
// 			return res
// 				.status(404)
// 				.json({ error: 'No buildings found for this worker' })
// 		}

// 		// Extract all gateway IDs from the buildings
// 		const gatewayIds = buildings.flatMap(building => building.gateway_sets)

// 		// Fetch all gateways from the gateway IDs and populate nodes
// 		const gateways = await Gateway.find({ _id: { $in: gatewayIds } }).populate(
// 			'nodes'
// 		)

// 		// Calculate the total number of nodes across all gateways
// 		const totalNodeCount = gateways.reduce(
// 			(sum, gateway) => sum + (gateway.nodes ? gateway.nodes.length : 0),
// 			0
// 		)

// 		// Extract UUIDs from gateways
// 		const gatewayUUIDs = gateways.map(gateway => gateway.serial_number) // Assuming 'serial_number' exists

// 		if (!gatewayUUIDs || gatewayUUIDs.length === 0) {
// 			return res
// 				.status(404)
// 				.json({ error: 'No gateways found for the associated buildings' })
// 		}

// 		// Unsubscribe from any previous topics
// 		currentTopics.forEach(topic => {
// 			mqttClient.unsubscribe(topic, err => {
// 				if (err) {
// 					console.error(`Unsubscription error from topic ${topic}:`, err)
// 				} else {
// 					console.log(`Unsubscribed from topic: ${topic}`)
// 				}
// 			})
// 		})

// 		// Subscribe to new topics using gateway UUIDs
// 		const newTopics = gatewayUUIDs.map(
// 			uuid => `GSSIOT/01030369081/GATE_PUB/00${uuid}`
// 		)

// 		newTopics.forEach(topic => {
// 			mqttClient.subscribe(topic, err => {
// 				if (!err) {
// 					console.log(`Subscribed to ${topic}`)
// 				} else {
// 					console.error(`Subscription error for topic ${topic}:`, err)
// 				}
// 			})
// 		})

// 		// Update currentTopics to track subscriptions
// 		currentTopics = newTopics

// 		// Return the subscribed UUIDs/topics along with the total node count to the client
// 		return res.json({
// 			success: `Subscribed to topics: ${newTopics.join(', ')}`,
// 			totalNodeCount, // Include the total count of nodes across all gateways
// 		})
// 	} catch (error) {
// 		console.error('Error fetching gateways or subscribing:', error)
// 		return res.status(500).json({ error: 'Server error' })
// 	}
// }

// mqttSubscribeController.getBuldingNodes = async (req, res) => {
// 	try {
// 		console.log('GET: User.contr: getBuldingNodes')
// 		const buildingId = req.params.id // Building ID ni olish

// 		// Building ni DB dan qidirish
// 		const building = await Building.findById(buildingId)
// 		if (!building) {
// 			return res.status(404).json({ error: 'No building found for this ID' })
// 		}

// 		// Buildingdan gateway ID larini olish
// 		const gatewayIds = building.gateway_sets

// 		// Gatewaylarni olish
// 		const gateways = await Gateway.find({ _id: { $in: gatewayIds } })

// 		// Har bir gatewaydan node larni olish
// 		const nodeIds = gateways.flatMap(gateway => gateway.nodes) // Gateway dan node ID larni olish

// 		// Node ID larini ishlatib, node larni topish
// 		const nodes = await Nodes.find({ _id: { $in: nodeIds } })

// 		return res.json({ state: 'Success', data: nodes }) // Topilgan node larni qaytarish
// 	} catch (error) {
// 		console.error('Xato:', error)
// 		return res.status(500).json({ error: 'Xato yuz berdi' })
// 	}
// }
