const supabase = require('../../config/supabase');

exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
  }

  try {
    // Registra o usuário no auth do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    // Insere os dados adicionais na tabela users (role, name)
    const userId = authData.user?.id;
    if (userId) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([{ id: userId, email, name, role: 'agent' }]);

      if (dbError) {
        console.error('Erro ao inserir na tabela users:', dbError);
        // Em um caso real deveríamos talvez apagar o usuário do auth para manter consistência,
        // mas aqui vamos apenas logar e retornar erro
        return res.status(500).json({ error: 'Erro ao salvar perfil do usuário.' });
      }
    }

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      user: authData.user
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      message: 'Login bem sucedido',
      session: data.session,
      user: data.user
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
};
