const assert = require('assert')
const NodeSchema = require('../Schema/Node.model')
const GateWaySchema = require('../Schema/Gateway.model')
const bcrypt = require('bcryptjs')
const Definer = require('../Lib/errors')
const { log } = require('console')
const Building = require('../Schema/Building.model')
const Client = require('../Schema/Client.model')
const MqttEventSchema = require('../Schema/Log.model')
const { mqttClient, mqttEmitter } = require('./Mqtt.service')

class ProductService {
	constructor() {
		this.nodeSchema = NodeSchema
		this.gateWaySchema = GateWaySchema
		this.buildingSchema = Building
		this.clientSchema = Client
		this.logSchema = MqttEventSchema
	}

	async createNodeData(data) {
		try {
			const new_node = new this.nodeSchema(data)
			const existNode = await this.nodeSchema.findOne({
				doorNum: data.doorNum,
			})
			if (existNode) {
				throw new Error('There is exist node:', existNode)
			}

			const result = await new_node.save()
			return result
		} catch (error) {
			throw error
		}
	}

	async createGateWayData(data) {
		try {
			const new_gate_way = new this.gateWaySchema(data)
			const nodesId = data.nodes
			const gw_number = data.serial_number
			const nodes = await this.nodeSchema.find(
				{ _id: { $in: nodesId } },
				{ doorNum: 1, _id: 0 }
			)

			let topic = `GSSIOT/01030369081/GATE_SUB/GRM22JU22P${gw_number}`

			const publishData = {
				cmd: 2,
				numNodes: nodes.length,
				nodes: nodes.map(node => node.doorNum),
			}
			console.log('Publish-data:', publishData, topic)

			// 3. MQTT serverga muvaffaqiyatli yuborilishini tekshirish
			if (mqttClient.connected) {
				const publishPromise = new Promise((resolve, reject) => {
					mqttClient.publish(topic, JSON.stringify(publishData), err => {
						if (err) {
							reject(new Error(`MQTT publishing failed for topic: ${topic}`))
						} else {
							resolve(true)
						}
					})
				})
				// Publish'ning natijasini kutamiz
				await publishPromise

				const mqttResponsePromise = new Promise((resolve, reject) => {
					mqttEmitter.once('gwPubRes', data => {
						if (data.resp === 'success') {
							resolve(true)
						} else {
							reject(new Error('Failed publishing gateway to mqtt'))
						}
					})

					// Javob kutilayotgan vaqtda taymer qo'shing
					setTimeout(() => {
						reject(new Error('MQTT response timeout'))
					}, 5000) // Masalan, 5 soniya kutish
				})

				await mqttResponsePromise
			} else {
				throw new Error('MQTT client is not connected')
			}

			await this.nodeSchema.updateMany(
				{ _id: { $in: data.nodes } },
				{ $set: { product_status: false } }
			)
			const result = await new_gate_way.save()

			return { success: true, result }
		} catch (error) {
			throw error
		}
	}

	async activeNodes() {
		try {
			const activeNodes = await this.nodeSchema.find({ product_status: true })
			assert(activeNodes, Definer.product_err2)
			return activeNodes
		} catch (error) {
			throw error
		}
	}

	async updateAllNodeStatusTrue() {
		await this.nodeSchema.updateMany({}, [
			{ $set: { product_status: { $not: '$product_status' } } },
		])
		const updatedNodes = await this.nodeSchema.find() // Barcha hujjatlarni qayta so'rash
		return updatedNodes
	}

	async updateNodeStatusTrue(id) {
		try {
			// ID bo'yicha hujjatni yangilash
			const result = await this.nodeSchema.findByIdAndUpdate(
				id,
				[
					{
						$set: {
							product_status: { $not: '$product_status' }, // true -> false, false -> true
						},
					},
				],
				{ new: true } // Yangilangan hujjatni qaytarish uchun
			)

			return result
		} catch (error) {
			console.error('Error updating node status:', error)
			throw error
		}
	}

	async deleteNode(id) {
		try {
			const deletedNode = await this.nodeSchema.findByIdAndDelete(id)
			if (!deletedNode) {
				throw new Error('Node not found')
			}

			const updatedNodes = await this.nodeSchema.find()
			return updatedNodes
		} catch (error) {
			console.error('Error deleting node:', error)
			throw error
		}
	}

	async updateGwSts() {
		const result = await this.gateWaySchema.updateMany(
			{},
			{ $set: { product_status: true } }
		)
		return result
	}

	async createBuildingData(data) {
		try {
			const {
				building_name,
				building_num,
				building_addr,
				gateway_sets,
				users,
				permit_date,
				expiration_date,
				building_sts,
			} = data

			const new_building = this.buildingSchema({
				building_name,
				building_num,
				building_addr,
				gateway_sets,
				users,
				permit_date: permit_date.split('T')[0], // Keep only the date part
				expiration_date: expiration_date.split('T')[0], // Keep only the date part
				building_sts,
			})

			// Step 1: Update product_status for gateways in gateway_sets
			await this.gateWaySchema.updateMany(
				{ _id: { $in: gateway_sets } },
				{ $set: { product_status: false } }
			)

			// const gateways = data.gateway_sets
			// console.log(gateways)

			const result = await new_building.save()
			return result
		} catch (error) {
			throw error
		}
	}

	async createClientData(data) {
		try {
			const new_client = new this.clientSchema(data)
			const result = await new_client.save()
			return result
		} catch (error) {
			throw error
		}
	}

	async getBuildingForBoss(userId) {
		try {
			const clients = await this.clientSchema.find({ boss_users: userId })
			if (!clients) {
				return
			}

			const buildignIds = clients.flatMap(client => client.buildings)

			const buildings = await this.buildingSchema
				.find({ _id: { $in: buildignIds } })
				.populate()
			if (buildings.length === 0) {
				return new Error('Buildings not found for this boss user')
			}

			return buildings
		} catch (error) {
			throw error
		}
	}

	async getBuildingForWorker(userId) {
		try {
			console.log('req-workerID:', userId)

			const buildings = await this.buildingSchema.find({ users: userId })
			if (buildings.length === 0) {
				return new Error('Buildings not found for this boss user')
			} else {
				return buildings
			}
		} catch (error) {
			throw error
		}
	}

	async getBuildings() {
		try {
			const builidngs = await this.buildingSchema.find({ building_sts: true })
			assert(builidngs, Definer.product_err2)
			return builidngs
		} catch (error) {
			throw error
		}
	}

	async activeGateways() {
		try {
			const activeGateways = await this.gateWaySchema.find({
				product_status: true,
			})
			assert(activeGateways, Definer.product_err2)
			return activeGateways
		} catch (error) {
			throw error
		}
	}

	async getLastLogsData(gwSets) {
		try {
			// Gatewaylarni topish
			const gateways = await this.gateWaySchema.find({
				serial_number: { $in: gwSets }, // gwSets dagi serial_numberlarga mos keladi
			})

			if (!gateways || gateways.length === 0) {
				return new Error('Hech qanday gateway topilmadi')
			}

			// Topilgan gatewaylardan node id-larni yig'ish
			const allNodeIds = gateways
				.flatMap(gateway => gateway.nodes) // gateway.nodes arraylarini birlashtirish
				.filter(Boolean) // null yoki undefined qiymatlarni olib tashlash

			if (allNodeIds.length === 0) {
				return new Error('Hech qanday node id topilmadi')
			}

			// Node id-larga mos bo'lgan node ma'lumotlarini olish
			const nodesData = await this.nodeSchema.find(
				{
					_id: { $in: allNodeIds }, // barcha node id-larga mos bo'lgan node'larni topish
				},
				{
					doorNum: 1, // Faqat doorNum maydonini olish
					_id: 0, // _id ni olib tashlash (ixtiyoriy)
				}
			)
			if (!nodesData || nodesData.length === 0) {
				return new Error("Hech qanday node ma'lumotlari topilmadi")
			}

			// Har bir doorNum uchun oxirgi logni topish
			const latestLogs = []
			for (const { doorNum } of nodesData) {
				const lastLog = await this.logSchema
					.findOne({ doorNum })
					.sort({ createdAt: -1 }) // Eng oxirgi log
				if (lastLog) {
					latestLogs.push(lastLog)
				}
			}

			return latestLogs
		} catch (error) {
			console.error(error)
			return error
		}
	}

	// =========== ADMIN related functions ========== //
	async getAllGwsData() {
		try {
			const gws = await this.gateWaySchema.find()
			if (!gws.length > 0) {
				return new Error('There is no any Gateways')
			}

			return gws
		} catch (error) {
			throw new Error('Error on get-all-gateways')
		}
	}

	async getAllNodesData() {
		try {
			const nodes = await this.nodeSchema.find()
			if (!nodes.length > 0) {
				return new Error('There is no any nodes')
			}

			return nodes
		} catch (error) {
			throw new Error('Error on get-all-gateways')
		}
	}

	async getAllClientsData() {
		try {
			const clients = await this.clientSchema.find()
			if (clients.length > 0) {
				return clients
			} else return new Error('There is no any clients')
		} catch (error) {
			throw new Error('Error on get-all-clients')
		}
	}

	async clientDetailData(id) {
		try {
			const clientDetails = await this.clientSchema
				.findById(id)
				.populate('buildings')
			if (!clientDetails) {
				throw new Error('Client not found :(')
			}
			return clientDetails
		} catch (error) {
			throw error
		}
	}

	async getBuildingsForAdminData() {
		try {
			const clients = await this.clientSchema.find()
			const buildignIds = clients.flatMap(client => client.buildings)

			const buildings = await this.buildingSchema.find({
				_id: { $in: buildignIds },
			})

			if (buildings.length === 0) {
				return new Error('Buildings not found!')
			}

			return buildings
		} catch (error) {
			return error
		}
	}

	async setNodesPositionData(data) {
		try {
			// Har bir element uchun alohida yangilash
			const updatePromises = data.map(async item => {
				const result = await this.nodeSchema.updateMany(
					{ doorNum: item.doorNum }, // doorNum'ga mos keladigan node'larni yangilash
					{ $set: { position: item.position } } // Har bir node uchun o'zining `position`ini yangilash
				)
				return {
					doorNum: item.doorNum,
					matchedCount: result.matchedCount,
					modifiedCount: result.modifiedCount,
				}
			})

			const results = await Promise.all(updatePromises)

			const noUpdates = results.filter(res => res.matchedCount === 0)
			if (noUpdates.length > 0) {
				return {
					state: 'Fail',
					message: 'Some nodes were not found',
					details: noUpdates,
				}
			}
			return results
		} catch (error) {
			return new Error('Error on node positioning.', error)
		}
	}
}

module.exports = ProductService
