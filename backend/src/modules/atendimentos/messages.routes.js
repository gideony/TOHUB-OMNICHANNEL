const express = require('express');
const router = express.Router();
const messagesController = require('./messages.controller');

router.get('/:contact_id', messagesController.getMessages);
const authMiddleware = require('../../middleware/auth.middleware');
router.post('/', authMiddleware, messagesController.sendMessage);

module.exports = router;
