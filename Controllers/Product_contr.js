const ProductService = require('../Service/Product.service')

let productController = module.exports

productController.createMultipleNodes = async (req, res) => {
	try {
		console.log('POST: contr.create-multiple-nodes')
		const nodes = req.body

		// Ma'lumot turi array ekanligini tekshiring
		if (!Array.isArray(nodes)) {
			return res.status(400).json({
				state: 'Failed',
				message: 'Invalid data format. Expected an array.',
			})
		}

		const nodeService = new ProductService()
		const createdNodes = []

		// Har bir node ma'lumotini qayta ishlash va yaratish
		for (const nodeData of nodes) {
			const newNode = await nodeService.createNodeData(nodeData)
			createdNodes.push(newNode)
		}

		res.status(201).send({
			state: 'Success',
			message: `${createdNodes.length} nodes created successfully!`,
			nodes: createdNodes,
		})
	} catch (error) {
		console.log('ERROR: contr.create-multiple-nodes', error)
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.getActiveNodes = async (req, res) => {
	try {
		console.log('GET: contr.product-active nodes')
		const nodeService = new ProductService()
		const active_nodes = await nodeService.activeNodes()
		res.json(active_nodes)
	} catch (error) {
		console.log('ERROR: contr.create-multiple-nodes', error)
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.createGateWay = async (req, res) => {
	try {
		console.log('POST: contr.product-gate_wayyy')
		const data = req.body
		if (data.nodes <= 0) {
			return res.send('There is no any Nodes selected. Please select nodes.')
		} else {
			const gateWayService = new ProductService(),
				new_gate_way = await gateWayService.createGateWayData(data)
			res.json({ state: 'Success', gate_way: new_gate_way })
		}
	} catch (error) {
		console.log('Error on createGateWay:', error.message)
		res.json({
			error: error.message,
		})
	}
}

productController.updateAllNodeStatusTrue = async (req, res) => {
	try {
		console.log('POST: update all node statuses to true')
		const nodeService = new ProductService()
		const result = await nodeService.updateAllNodeStatusTrue()
		res.json({
			state: 'Success',
			message: 'All nodes updated to true',
			updated_nodes: result,
		})
	} catch (error) {
		console.log('ERROR: update all nodes', error)
		res.status(500).json({ state: 'Fail', message: error.message })
	}
}

productController.updateNodeStatusTrue = async (req, res) => {
	try {
		console.log('POST: update node statuses to true')
		const { id } = req.params
		const nodeService = new ProductService()
		const result = await nodeService.updateNodeStatusTrue(id)
		res.json({
			state: 'Success',
			updated_node: result,
		})
	} catch (error) {
		console.log('ERROR: update all nodes', error)
		res.status(500).json({ state: 'Fail', message: error.message })
	}
}

productController.deleteNode = async (req, res) => {
	try {
		console.log('POST: deleteNode')
		const { id } = req.params
		const nodeService = new ProductService()
		const result = await nodeService.deleteNode(id)
		res.json({
			state: 'Success',
			updated_node: result,
		})
	} catch (error) {
		console.log('ERROR: update all nodes', error)
		res.status(500).json({ state: 'Fail', message: error.message })
	}
}

productController.updateGatewaysSts = async (req, res) => {
	try {
		console.log('POST: update all updateGatewaysSts to true')
		const GWService = new ProductService()
		await GWService.updateGwSts()
		res.json({ state: 'Success', message: 'All nodes updated to true' })
	} catch (error) {
		console.log('ERROR: update all nodes', error)
		res.status(500).json({ state: 'Fail', message: error.message })
	}
}

productController.createBuilding = async (req, res) => {
	try {
		console.log('POST: contr.product-Building')
		const data = req.body
		const buildingService = new ProductService(),
			new_building = await buildingService.createBuildingData(data)
		res.json({ state: 'Success', builiding: new_building })
	} catch (error) {
		console.log('ERROR: contr.product-Building', error)
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.createClient = async (req, res) => {
	try {
		console.log('POST: contr.product-Client')
		const data = req.body
		const clientService = new ProductService(),
			new_client = await clientService.createClientData(data)
		res.json({ state: 'Success', client: new_client })
	} catch (error) {
		console.log('ERROR: contr.product-Building', error)
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

//  ========= data getting related methods ======== //

productController.getBuildingsForBoss = async (req, res) => {
	try {
		console.log('GET: Product.Contr-getbossBuildings')
		const { userId } = req.query
		const buildingService = new ProductService()
		const buildings = await buildingService.getBuildingForBoss(userId)
		res.json({ state: 'Success', buildings: buildings })
	} catch (error) {
		console.error('Error fetching buildings for user:', error)
		res.json({ state: 'fail', error: error.message })
	}
}

productController.getBuildingsForWorker = async (req, res) => {
	try {
		console.log('GET: Product.Contr-get-worker-Buildings')
		const { userId } = req.query
		const buildingService = new ProductService()
		const buildings = await buildingService.getBuildingForWorker(userId)
		res.json({ state: 'Success', buildings: buildings })
	} catch (error) {
		console.error('Error fetching buildings for user:', error)
		res.json({ state: 'fail', error: error.message })
	}
}

productController.getBuildings = async (req, res) => {
	try {
		console.log('GET: contr.product-getBuildings')
		const id = req.user?._id
		const buildingService = new ProductService()
		const buildings = await buildingService.getBuildings(id)
		res.json({ state: 'Success', data: buildings })
		return buildings
	} catch (error) {
		console.error('Error fetching buildings for user:', error)
		throw new Error('Could not fetch buildings')
	}
}

productController.getActiveGateways = async (req, res) => {
	try {
		console.log('GET: contr.product-active Gateways')
		const nodeService = new ProductService()
		const active_gateways = await nodeService.activeGateways()
		res.json(active_gateways)
	} catch (error) {
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.getLastLogs = async (req, res) => {
	try {
		console.log('GET: contr.product-getLastLogs')
		const { gateway_sets } = req.body
		console.log('gateway_sets:', gateway_sets)
		// gwSets massivga aylantiriladi (Agar query parametre string bo'lsa, massivga aylantiramiz)
		const gwSetsArray = Array.isArray(gateway_sets)
			? gateway_sets
			: [gateway_sets]
		const nodeService = new ProductService()
		const result = await nodeService.getLastLogsData(gwSetsArray)
		return res.json(result)
	} catch (error) {
		throw error
	}
}

// ========== ADMIN related methods =========== //
productController.getAllGws = async (req, res) => {
	try {
		console.log('GET: product-Contr. getAllGws')
		const productService = new ProductService()
		const gws = await productService.getAllGwsData()
		return res.json({ state: 'Success', gateways: gws })
	} catch (error) {
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.getAllNodes = async (req, res) => {
	try {
		console.log('GET: product-Contr. getAllNodes')
		const productService = new ProductService()
		const nodes = await productService.getAllNodesData()
		return res.json({ state: 'Success', nodes: nodes })
	} catch (error) {
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.getAllClients = async (req, res) => {
	try {
		console.log('GET: product-Contr. getAllClients')
		const productService = new ProductService()
		const clients = await productService.getAllClientsData()
		if (!clients.length > 0) {
			return res.json({ state: 'Fail', message: 'There is no any clients' })
		}

		return res.json({ state: 'Success', clients: clients })
	} catch (error) {
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.clientDetails = async (req, res) => {
	try {
		console.log('GET: product-contr: clientDetails')
		const { id } = req.params
		const clientServie = new ProductService()
		const response = await clientServie.clientDetailData(id)
		if (!response) {
			throw new Error('Error on get Client details')
		}
		res.json({ success: true, data: response })
	} catch (error) {
		console.log('Error on clientDetails:', error.message)
		res.status(500).json({ state: 'Failed', message: error.message })
	}
}

productController.getBuildingsForAdmin = async (req, res) => {
	try {
		console.log('GET: Product.Contr-getbossBuildings')
		const { userId } = req.query
		const buildingService = new ProductService()
		const buildings = await buildingService.getBuildingsForAdminData()

		res.json({ state: 'Success', buildings: buildings })
	} catch (error) {
		console.log('Error on getBuildingsForAdmin', error.message)
		res.json({ state: 'Fail', error: error })
	}
}

productController.setNodesPosition = async (req, res) => {
	try {
		console.log('POST: Product-conr: setNodesPosition')
		const data = req.body

		// Ma'lumotlarni tekshirish
		for (const item of data) {
			if (!item.doorNum || !item.position) {
				return res.json({ error: 'Fail', message: 'No matching CSV file' })
			}
		}

		const nodeService = new ProductService()
		const result = await nodeService.setNodesPositionData(data)

		// Agar xizmat xatosi bo'lsa
		if (result.state === 'Fail') {
			return res.json({
				state: 'Fail',
				message: result.message,
				details: result.details,
			})
		}

		// Muvaffaqiyatli javob
		res.json({ state: 'Success', positioned: result })
	} catch (error) {
		console.log('Error on setNodesPosition', error.message)
		res.status(500).json({ state: 'Fail', error: error.message })
	}
}
