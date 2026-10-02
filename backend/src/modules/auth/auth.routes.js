const express = require('express')
const { registerUser, loginUser, logoutUser } = require('./auth.service')

const router = express.Router()

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password e name são obrigatórios'
      })
    }

    const result = await registerUser(email, password, name)

    if (!result.success) {
      return res.status(400).json(result)
    }

    res.status(201).json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email e password são obrigatórios'
      })
    }

    const result = await loginUser(email, password)

    if (!result.success) {
      return res.status(400).json(result)
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// POST /auth/logout
router.post('/logout', async (req, res) => {
  const result = await logoutUser()
  res.json(result)
})

module.exports = router
