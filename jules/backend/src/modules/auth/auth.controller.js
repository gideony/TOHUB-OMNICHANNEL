const supabase = require('../../config/supabase');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Generate custom JWT or use Supabase's access token
    const token = jwt.sign({ id: data.user.id, email: data.user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ token, user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Insert into users table as well, though Supabase might handle it via triggers,
    // explicitly handling it as requested.
    if (data.user) {
        const { error: insertError } = await supabase
            .from('users')
            .upsert({
                id: data.user.id,
                email: email,
                name: name || email.split('@')[0],
                role: 'agent'
            });

        if (insertError) {
             console.error("Error inserting to users table:", insertError);
        }
    }

    const token = jwt.sign({ id: data.user.id, email: data.user.email }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({ token, user: data.user });
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
