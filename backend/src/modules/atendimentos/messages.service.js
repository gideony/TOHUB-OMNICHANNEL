const supabase = require('../../config/supabase')

// BUSCAR MENSAGENS DE UM CONTATO
const getMessagesByContact = async (contactId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('contact_id', contactId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

// BUSCAR TODOS OS CONTATOS COM ÚLTIMAS MENSAGENS
const getAllContactsWithMessages = async () => {
  const { data, error } = await supabase
    .from('contacts')
    .select(`
      *,
      messages(body, direction, created_at)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ENVIAR MENSAGEM (Agente responde)
const sendMessage = async (contactId, body, userId) => {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      contact_id: contactId,
      channel: 'whatsapp',
      sender_type: 'agent',
      sender_id: userId,
      body: body,
      direction: 'out',
      status: 'pending'
    }])
    .select()

  if (error) throw error
  return data[0]
}

module.exports = {
  getMessagesByContact,
  getAllContactsWithMessages,
  sendMessage
}
