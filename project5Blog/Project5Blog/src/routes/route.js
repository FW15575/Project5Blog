const express = require('express');

const router = express.Router();

const { userController ,productController } = require('../controllers');
const { userAuth } = require('../middlewares')
// Author routes
router.post('/register', userController.registerUser);
// router.post('/login', userController.loginUser);
router.post('/products', productController.registerProduct);
router.get('/products', productController.listProducts);
router.get('/products/:productId', productController.getProductById);
module.exports = router;