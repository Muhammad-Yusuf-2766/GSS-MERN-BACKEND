const mqtt = require('mqtt')
const MqttEventSchema = require('../Schema/Log.model')
const EventEmitter = require('events')
// MQTT client setup

// Xabarlarni tarqatish uchun EventEmitter
const mqttEmitter = new EventEmitter()

const nodeTopic = [
	'GSSIOT/01030369081/GATE_PUB/+',
	'GSSIOT/01030369081/GATE_RES/+',
]
const Topic = 'GSSIOT/01030369081/GATE_PUB/'
const gwResTopic = 'GSSIOT/01030369081/GATE_RES/'

let isMessageListenerAdded = false // Listenerning qo'shilganligini tekshirish uchun flag

// ================= MQTT LOGICS =============== //

const mqttClient = mqtt.connect('mqtt://gssiot.iptime.org:10200', {
	username: '01030369081',
	password: 'qwer1234',
	// connectTimeout: 30 * 1000,
})

mqttClient.on('connect', () => {
	console.log('Connected to GSSIOT MQTT server')
	nodeTopic.forEach(topic => {
		mqttClient.subscribe(topic, function (err) {
			if (!err) {
				console.log('Subscribed to:', topic)
			} else {
				console.log('Error subscribing:', err)
			}
		})
	})
})

if (!isMessageListenerAdded) {
	mqttClient.on('message', async (topic, message) => {
		const data = JSON.parse(message.toString())
		const serialNumber = topic.split('/').pop().slice(-4) // Mavzudan UUID ni olish
		console.log(`MQTT_data ${serialNumber}: ${message}`)

		if (topic.startsWith(Topic)) {
			const eventData = {
				gw_number: serialNumber,
				doorNum: data.doorNum,
				doorChk: data.doorChk,
				betChk: data.betChk,
			}
			const mqttEventSchema = new MqttEventSchema(eventData)
			await mqttEventSchema.save()
			mqttEmitter.emit('mqttMessage', { serialNumber, data })
		} else if (topic.startsWith(gwResTopic)) {
			console.log('Gateway-creation event:', data)
			getGwRes(data)
		}
	})
	isMessageListenerAdded = true
}

mqttClient.on('error', error => {
	console.error('MQTT connection error:', error)
})

const getGwRes = data => {
	mqttEmitter.emit('gwPubRes', data)
}

module.exports = { mqttEmitter, mqttClient }
