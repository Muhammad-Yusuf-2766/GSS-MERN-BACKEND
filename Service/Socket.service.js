const Building = require('../Schema/Building.model')
const Gateway = require('../Schema/Gateway.model')
const { mqttEmitter } = require('./Mqtt.service')

let io

const getBuildingIdByGatewaySerialNum = async serialNumber => {
	const buildings = await Building.find()
	if (!buildings || buildings.length === 0) {
		throw new Error('No buildings found')
	}
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

const setupSocket = serverIo => {
	io = serverIo

	mqttEmitter.on('mqttMessage', async ({ serialNumber, data }) => {
		const buildingId = await getBuildingIdByGatewaySerialNum(serialNumber)
		if (buildingId) {
			// console.log('Socket emitting:', serialNumber, data)
			io.emit(`mqttData_${buildingId}`, {
				serialNumber,
				data: JSON.stringify(data),
			})
		}
	})

	io.on('connection', socket => {
		console.log(`New SOCKET user connected: ${socket.id}`)

		// Foydalanuvchi buildingni subscribe qilmoqchi
		socket.on('subscribeToBuilding', buildingId => {
			console.log(`Client subscribed to building: ${buildingId}`)
			socket.join(`building_${buildingId}`)
		})

		// Foydalanuvchi uzilib qolganda
		socket.on('disconnect', () => {
			console.log(`SOCKET user disconnected: ${socket.id}`)
		})
	})
}

module.exports = { setupSocket }
