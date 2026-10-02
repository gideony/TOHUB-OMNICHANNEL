const supabase = require('../config/supabase')

// Parser para formato SIMPLIFICADO (Semana 1)
const parseSimplifiedFormat = (body) => {
  return {
    from: body.from,
    message: body.message,
    timestamp: body.timestamp
  }
}

// Parser para formato META (Semana 2+)
const parseMetaFormat = (body) => {
  const message = body.entry[0].changes[0].value.messages[0]
  return {
    from: message.from,
    message: message.text.body,
    timestamp: message.timestamp
  }
}

// WEBHOOK HANDLER
const handleWebhook = async (req, res) => {
  try {
    const body = req.body
    console.log('📨 WhatsApp Webhook recebido:', JSON.stringify(body, null, 2))

    // Detectar formato
    const isMetaFormat = body.object === 'whatsapp_business_account'
    const parsed = isMetaFormat ? parseMetaFormat(body) : parseSimplifiedFormat(body)

    const { from, message, timestamp } = parsed

    // 1. Buscar ou criar contato
    let { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select()
      .eq('phone', from)
      .single()

    if (contactError && contactError.code === 'PGRST116') {
      // Contato não existe, criar novo
      const { data: newContact, error: createError } = await supabase
        .from('contacts')
        .insert([{
          phone: from,
          source: 'whatsapp',
          name: `WhatsApp ${from}`
        }])
        .select()
        .single()

      if (createError) throw createError
      contact = newContact
    } else if (contactError) {
      throw contactError
    }

    // 2. Salvar mensagem
    const { error: msgError } = await supabase
      .from('messages')
      .insert([{
        contact_id: contact.id,
        channel: 'whatsapp',
        sender_type: 'contact',
        sender_id: from,
        body: message,
        direction: 'in',
        created_at: new Date(timestamp * 1000)
      }])

    if (msgError) throw msgError

    // 3. Emitir evento Socket.io pra agentes
    const io = req.app.get('io')
    io.emit('new_message', {
      contact: {
        id: contact.id,
        phone: contact.phone,
        name: contact.name
      },
      message: {
        body: message,
        channel: 'whatsapp',
        timestamp: new Date(timestamp * 1000)
      }
    })

    console.log('✅ Mensagem salva e emitida via Socket.io')
    res.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Erro no webhook:', error.message)
    res.status(400).json({
      success: false,
      error: error.message
    })
  }
}

// VERIFICAÇÃO DE WEBHOOK (Meta exige)
const verifyWebhook = (req, res) => {
  const mode = req.query['hub.mode']
  const token = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_TOKEN) {
    res.status(200).send(challenge)
    console.log('✅ Webhook verificado!')
  } else {
    res.sendStatus(403)
  }
}

module.exports = { handleWebhook, verifyWebhook }
