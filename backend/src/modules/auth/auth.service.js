const supabase = require('../../config/supabase')

// REGISTRO (Supabase Native)
const registerUser = async (email, password, name) => {
  try {
    // 1. Criar usuário no auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) throw authError

    // 2. Salvar dados adicionais na tabela users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{
        id: authData.user.id,
        email,
        name,
        role: 'agent'
      }])
      .select()

    if (userError) throw userError

    return {
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: name
      }
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// LOGIN (Supabase Native)
const loginUser = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      token: data.session.access_token
    }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// LOGOUT
const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()
  return { success: !error, error: error?.message }
}

module.exports = { registerUser, loginUser, logoutUser }
