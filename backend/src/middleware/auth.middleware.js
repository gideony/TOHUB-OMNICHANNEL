const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token de autenticação ausente' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Formato de token inválido' });
  }

  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error('Erro na autenticação:', err);
    res.status(500).json({ error: 'Erro interno na validação da autenticação' });
  }
};

module.exports = authMiddleware;
