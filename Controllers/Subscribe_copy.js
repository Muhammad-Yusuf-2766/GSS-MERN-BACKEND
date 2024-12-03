const mqttClient = require('../Service/Mqtt.service')
const Client = require('../Schema/Client.model')
const Building = require('../Schema/Building.model')
const Gateway = require('../Schema/Gateway.model')
const Nodes = require('../Schema/Node.model')

// Declare a variable for io
let io

setTimeout(() => {
	const { io: socketIo } = require('../index')
	io = socketIo // Assign the imported io to the variable
}, 1000) // Ensure the server is initialized

let isMessageListenerAdded = false // Listenerning qo'shilganligini tekshirish uchun flag

let mqttSubscribeController2 = module.exports

mqttSubscribeController2.subscribeBossGateways = async (req, res) => {
	try {
		console.log('GET: User Controller - subscribeBossGateways')

		const { userId } = req.query

		// Foydalanuvchiga tegishli Clientni topish
		const clients = await Client.find({ boss_users: userId })
		if (!clients || clients.length === 0) {
			return res
				.status(404)
				.json({ error: 'Foydalanuvchi uchun client topilmadi' })
		}

		const buildingIds = clients.flatMap(client => client.buildings)

		// Foydalanuvchiga tegishli buildinglarni olish
		const buildings = await Building.find({ _id: { $in: buildingIds } })
		if (!buildings || buildings.length === 0) {
			return res
				.status(404)
				.json({ error: 'Foydalanuvchiga tegishli building topilmadi' })
		}

		// Har bir building uchun gateway ID larini olish
		const gatewayIds = buildings.flatMap(building => building.gateway_sets)

		// Gatewaylarni ID lar orqali topish va node'larni ichiga qo'shish
		const gateways = await Gateway.find({ _id: { $in: gatewayIds } }).populate(
			'nodes'
		)
		if (!gateways || gateways.length === 0) {
			return res
				.status(404)
				.json({ error: 'Foydalanuvchiga tegishli gateway topilmadi' })
		}

		// Umumiy node sonini hisoblash va serial_numberlarni olish
		const totalNodeCount = gateways.reduce(
			(sum, gateway) => sum + gateway.nodes.length,
			0
		)
		const gatewaySerialNumbers = gateways.map(gw => gw.serial_number)

		// Javob qaytarish
		return res.json({
			success: `Foydalanuvchiga tegishli gateways topildi.`,
			totalNodeCount,
			gateway_sets: gatewaySerialNumbers,
		})
	} catch (error) {
		console.error('Gatewaylarni olish yoki subscribe qilishda xato:', error)
		return res.status(500).json({ error: 'Server xatosi' })
	}
}

mqttSubscribeController2.subscribeWorkerGateways = async (req, res) => {
	try {
		console.log('GET: User Controller - subscribeWorkerGateways')
		const { userId } = req.query
		// Foydalanuvchiga tegishli Clientni topish
		const buildings = await Building.find({ users: userId })
		if (!buildings) {
			return res
				.status(404)
				.json({ error: 'Foydalanuvchi uchun Building topilmadi' })
		}
		// Har bir building uchun gateway ID larini olish
		const gatewayIds = buildings.flatMap(building => building.gateway_sets)

		// Gatewaylarni ID lar orqali topish va node'larni ichiga qo'shish
		const gateways = await Gateway.find({ _id: { $in: gatewayIds } }).populate(
			'nodes'
		)

		if (!gateways || gateways.length === 0) {
			return res
				.status(404)
				.json({ error: 'Foydalanuvchiga tegishli gateway topilmadi' })
		}

		// Umumiy node sonini qaytarish
		const totalNodeCount = gateways.reduce(
			(sum, gateway) => sum + gateway.nodes.length,
			0
		)
		const gatewaySerialNumbers = gateways.map(gw => gw.serial_number)

		return res.json({
			success: `Mavzularga subscribe qilindi:)`,
			totalNodeCount,
			gateway_sets: gatewaySerialNumbers,
		})
	} catch (error) {
		console.error('Gatewaylarni olish yoki subscribe qilishda xato:', error)
		return res.status(500).json({ error: 'Server xatosi' })
	}
}

// ======== Subscribe All gateways for ADMIN ======== //

mqttSubscribeController2.subscribeAdminGateways = async (req, res) => {
	try {
		console.log('GET: User Controller - Admin subscribeAdminGateways')
		const { userId, userType } = req.query // userId ni query orqali olish
		console.log('Request User Id:', userId, userType)

		if (userType === 'ADMIN') {
			const clients = await Client.find()
			if (!clients) {
				return res.json({ error: 'Hech qanday client topilmadi. :(' })
			}

			const buildingIds = clients.flatMap(client => client.buildings)

			const buildings = await Building.find({ _id: { $in: buildingIds } })

			// Har bir building uchun gateway ID larini olish
			const gatewayIds = buildings.flatMap(building => building.gateway_sets)

			// Gatewaylarni ID lar orqali topish va nodelarni ichiga qo'shish
			const gateways = await Gateway.find({
				_id: { $in: gatewayIds },
			}).populate('nodes')

			if (!gateways || gateways.length === 0) {
				return res
					.status(404)
					.json({ error: 'Foydalanuvchiga tegishli gateway topilmadi' })
			}

			// Umumiy node sonini qaytarish
			const totalNodeCount = gateways.reduce(
				(sum, gateway) => sum + gateway.nodes.length,
				0
			)
			const gatewaySerialNumbers = gateways.map(gw => gw.serial_number)
			return res.json({
				success: `Mavzularga subscribe qilindi:)`,
				totalNodeCount,
				gateway_sets: gatewaySerialNumbers,
			})
		} else {
			res.json({ state: false, message: 'you are not ADMIN user' })
		}
	} catch (error) {
		console.error('Gatewaylarni olish yoki subscribe qilishda xato:', error)
		return res.status(500).json({ error: 'Server xatosi' })
	}
}

// =========== removeListeners for User with try-catch ============ //
// mqttSubscribeController2.unsubscribeUserGateways = (req, res) => {
// 	try {
// 		console.log('DELETE: mqttContr: unsubscribeUserGateways')
// 		const { userId } = req.query
// 		let isUnsubscribed = false

// 		currentTopics.forEach(topic => {
// 			const subscribers = topicSubscribers.get(topic)
// 			if (subscribers) {
// 				subscribers.delete(userId) // Remove the user from the topic's subscriber set

// 				if (subscribers.size === 0) {
// 					// If no subscribers are left, unsubscribe from the topic
// 					mqttClient.unsubscribe(topic, err => {
// 						if (err) {
// 							console.error(
// 								`Error while unsubscribing from topic: ${topic}`,
// 								err
// 							)
// 						} else {
// 							console.log(`Successfully unsubscribed from topic: ${topic}`)
// 						}
// 					})
// 					topicSubscribers.delete(topic, () => console.log(topicSubscribers)) // Remove the topic from the map
// 				}
// 				isUnsubscribed = true
// 			}
// 		})

// 		if (isUnsubscribed) {
// 			return res.json({ state: 'success', deleted: userId })
// 		} else {
// 			return res.status(404).json({
// 				state: 'failure',
// 				message: 'User not subscribed to any topics',
// 			})
// 		}
// 	} catch (error) {
// 		console.error('An error occurred in unsubscribeUserGateways:', error)
// 		res.status(500).json({ state: 'failure', message: 'Server error occurred' })
// 	}
// }

// Gateway SerialNum orqali building ID ni olish uchun yordamchi funksiya
async function getBuildingIdByGatewaySerialNum(buildings, serialNumber) {
	for (const building of buildings) {
		const gatewayIds = building.gateway_sets
		const gateways = await Gateway.find({ _id: { $in: gatewayIds } })

		// Topilgan gatewaylarda serialNumber (SerialNum_type) ni tekshiring
		for (const gateway of gateways) {
			if (gateway.serial_number === serialNumber) {
				// Agar UUID mos kelsa, building ID sini qaytarish
				return building._id
			}
		}
	}
	return null
}

// ================================ WORKER Subscribe part =============================== //
mqttSubscribeController2.subscribeWorker = async (req, res) => {
	try {
		console.log('GET: User.contr: subscribeWorker')
		const { userId } = req.query // Extract userId from query parameters
		console.log('Request User Id:', userId)

		// Find all buildings where the user is listed in the `users` array
		const buildings = await Building.find({ users: userId })

		if (!buildings || buildings.length === 0) {
			return res
				.status(404)
				.json({ error: 'No buildings found for this worker' })
		}

		// Extract all gateway IDs from the buildings
		const gatewayIds = buildings.flatMap(building => building.gateway_sets)

		// Fetch all gateways from the gateway IDs and populate nodes
		const gateways = await Gateway.find({ _id: { $in: gatewayIds } }).populate(
			'nodes'
		)

		// Calculate the total number of nodes across all gateways
		const totalNodeCount = gateways.reduce(
			(sum, gateway) => sum + (gateway.nodes ? gateway.nodes.length : 0),
			0
		)

		// Extract UUIDs from gateways
		const gatewayUUIDs = gateways.map(gateway => gateway.serial_number) // Assuming 'serial_number' exists

		if (!gatewayUUIDs || gatewayUUIDs.length === 0) {
			return res
				.status(404)
				.json({ error: 'No gateways found for the associated buildings' })
		}

		// Unsubscribe from any previous topics
		currentTopics.forEach(topic => {
			mqttClient.unsubscribe(topic, err => {
				if (err) {
					console.error(`Unsubscription error from topic ${topic}:`, err)
				} else {
					console.log(`Unsubscribed from topic: ${topic}`)
				}
			})
		})

		// Subscribe to new topics using gateway UUIDs
		const newTopics = gatewayUUIDs.map(
			uuid => `GSSIOT/01030369081/GATE_PUB/00${uuid}`
		)

		newTopics.forEach(topic => {
			mqttClient.subscribe(topic, err => {
				if (!err) {
					console.log(`Subscribed to ${topic}`)
				} else {
					console.error(`Subscription error for topic ${topic}:`, err)
				}
			})
		})

		// Update currentTopics to track subscriptions
		currentTopics = newTopics

		// Return the subscribed UUIDs/topics along with the total node count to the client
		return res.json({
			success: `Subscribed to topics: ${newTopics.join(', ')}`,
			totalNodeCount, // Include the total count of nodes across all gateways
		})
	} catch (error) {
		console.error('Error fetching gateways or subscribing:', error)
		return res.status(500).json({ error: 'Server error' })
	}
}

mqttSubscribeController2.getBuldingNodes = async (req, res) => {
	try {
		console.log('GET: User.contr: getBuldingNodes')
		const buildingId = req.params.id // Building ID ni olish

		// Building ni DB dan qidirish
		const building = await Building.findById(buildingId)
		if (!building) {
			return res.status(404).json({ error: 'No building found for this ID' })
		}

		// Buildingdan gateway ID larini olish
		const gatewayIds = building.gateway_sets

		// Gatewaylarni olish
		const gateways = await Gateway.find({ _id: { $in: gatewayIds } })

		// Har bir gatewaydan nodeId larni olish
		const nodeIds = gateways.flatMap(gateway => gateway.nodes)

		// Node ID larini ishlatib, node larni topish
		const nodes = await Nodes.find({ _id: { $in: nodeIds } })

		return res.json({ state: 'Success', data: nodes })
	} catch (error) {
		console.error('Xato:', error)
		return res.status(500).json({ error: 'Xato yuz berdi' })
	}
}
