const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.get('/:userId', cartController.getCartByUser);
router.post('/', cartController.addToCart);
router.put('/:id', cartController.updateCartItem);
router.delete('/:id', cartController.deleteCartItem);
router.delete('/user/:userId', cartController.clearCart); // Xoá toàn bộ giỏ hàng của user

module.exports = router;
