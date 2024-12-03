const express = require('express')
const product_router = express.Router()
const productController = require('../Controllers/Product_contr')
// const userController = require('../Controllers/User_contr')
const mqttController2 = require('../Controllers/Subscribe_copy')

/********************************
 *          REST API            *
 ********************************/

// User routs

product_router.get('/active-nodes', productController.getActiveNodes)
product_router.get('/active-gateways', productController.getActiveGateways)
product_router.post(
	'/create-multiple-nodes',
	productController.createMultipleNodes
)
product_router.post('/create-gateway', productController.createGateWay)
product_router.get(
	'/update-allnodes_sts',
	productController.updateAllNodeStatusTrue
)
product_router.get(
	'/update-node_sts/:id',
	productController.updateNodeStatusTrue
)
product_router.delete('/delete-node/:id', productController.deleteNode)
product_router.post('/update-gateway_sts', productController.updateGatewaysSts)
product_router.post('/create-building', productController.createBuilding)
product_router.post('/create-client', productController.createClient)
product_router.get('/get-buildings', productController.getBuildings)
product_router.get(
	'/boss-subscribe-mqtt',
	mqttController2.subscribeBossGateways
)
product_router.get(
	'/worker-subscribe-mqtt',
	mqttController2.subscribeWorkerGateways
)
product_router.get(
	'/admin-subscribe-mqtt',
	mqttController2.subscribeAdminGateways
)
product_router.get('/get-boss/buildings', productController.getBuildingsForBoss)
product_router.get(
	'/get-admin/buildings',
	productController.getBuildingsForAdmin
)
product_router.get(
	'/get-worker/buildings',
	productController.getBuildingsForWorker
)
product_router.get(
	'/get-boss/building-nodes/:id',
	mqttController2.getBuldingNodes
)
product_router.get('/get-all-clients', productController.getAllClients)
product_router.get('/client/:id', productController.clientDetails)
product_router.post('/get/last-logs', productController.getLastLogs)
product_router.post('/setnodes-position', productController.setNodesPosition)
product_router.get('/all-gateways', productController.getAllGws)
product_router.get('/all-nodes', productController.getAllNodes)

module.exports = product_router
