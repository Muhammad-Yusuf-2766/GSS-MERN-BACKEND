const express = require('express')
const product_router = express.Router()
const productController = require('../Controllers/Product_contr')
// const userController = require('../Controllers/User_contr')
const mqttController2 = require('../Controllers/Subscribe_copy')
const {
	retrieveAdminUser,
	retrieveClientUser,
} = require('../middlewares/auth.middleware')

/********************************
 *          REST API            *
 ********************************/

// ========= CLIENT related endpoints ========= //

product_router.get(
	'/boss-subscribe-mqtt',
	retrieveClientUser,
	mqttController2.subscribeBossGateways
)
product_router.get(
	'/worker-subscribe-mqtt',
	retrieveClientUser,
	mqttController2.subscribeWorkerGateways
)

product_router.get(
	'/get-boss/buildings',
	retrieveClientUser,
	productController.getBuildingsForBoss
)

product_router.get(
	'/get-worker/buildings',
	retrieveClientUser,
	productController.getBuildingsForWorker
)
product_router.get(
	'/get/building-nodes/:id',
	// retrieveClientUser,
	mqttController2.getBuldingNodes
)

// ========= ADMIN related endpoints ======== //
product_router.get(
	'/admin-subscribe-mqtt',
	retrieveAdminUser,
	mqttController2.subscribeAdminGateways
)

product_router.get(
	'/get-admin/buildings',
	retrieveAdminUser,
	productController.getBuildingsForAdmin
)

product_router.get(
	'/active-nodes',
	retrieveAdminUser,
	productController.getActiveNodes
)
product_router.get(
	'/active-gateways',
	retrieveAdminUser,
	productController.getActiveGateways
)
product_router.post(
	'/create-multiple-nodes',
	retrieveAdminUser,
	productController.createMultipleNodes
)
product_router.post(
	'/create-gateway',
	retrieveAdminUser,
	productController.createGateWay
)
product_router.get(
	'/update-allnodes_sts',
	retrieveAdminUser,
	productController.updateAllNodeStatusTrue
)
product_router.get(
	'/update-node_sts/:id',
	retrieveAdminUser,
	productController.updateNodeStatusTrue
)
product_router.delete(
	'/delete-node/:id',
	retrieveAdminUser,
	productController.deleteNode
)
product_router.post(
	'/update-gateway_sts',
	retrieveAdminUser,
	productController.updateGatewaysSts
)
product_router.post(
	'/create-building',
	retrieveAdminUser,
	productController.createBuilding
)
product_router.post(
	'/create-client',
	retrieveAdminUser,
	productController.createClient
)
product_router.get(
	'/get-buildings',
	retrieveAdminUser,
	productController.getBuildings
)

product_router.get(
	'/get-all-clients',
	retrieveAdminUser,
	productController.getAllClients
)
product_router.get(
	'/client/:id',
	retrieveAdminUser,
	productController.clientDetails
)
product_router.post(
	'/get/last-logs',
	retrieveAdminUser,
	productController.getLastLogs
)
product_router.post(
	'/setnodes-position',
	retrieveAdminUser,
	productController.setNodesPosition
)
product_router.get(
	'/all-gateways',
	retrieveAdminUser,
	productController.getAllGws
)
product_router.get(
	'/all-nodes',
	retrieveAdminUser,
	productController.getAllNodes
)

module.exports = product_router
