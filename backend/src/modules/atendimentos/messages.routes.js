const express = require('express')
const {
  getMessagesByContact,
  getAllContactsWithMessages,
  sendMessage
} = require('./messages.service')

const router = express.Router()

// GET /messages/contacts
router.get('/contacts', async (req, res) => {
  try {
    const data = await getAllContactsWithMessages()
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// GET /messages/:contactId
router.get('/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params
    const data = await getMessagesByContact(contactId)
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /messages
router.post('/', async (req, res) => {
  try {
    const { contactId, body, userId } = req.body

    if (!contactId || !body || !userId) {
      return res.status(400).json({
        error: 'contactId, body e userId são obrigatórios'
      })
    }

    const message = await sendMessage(contactId, body, userId)

    // Emitir via Socket.io
    const io = req.app.get('io')
    io.emit('new_message_sent', message)

    res.status(201).json(message)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
