const bcrypt = require("bcrypt");
const db = require("../config/db"); // your MySQL2 connection
const saltRounds = 10;
const {v4:uuidv4} = require("uuid")

exports.createUser = async (req, res) => {
  const { first_name, last_name, date_of_birth, location, email, phone, password } = req.body;
  // console.log(req)

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const user_id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.execute(
      `INSERT INTO users (user_id, first_name, last_name, date_of_birth, location, email, phone, password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [user_id, first_name, last_name, date_of_birth, location, email, phone, hashedPassword]
    );

    res.status(201).json({
      message: 'User created',
      data: {
        student_id: user_id,
        first_name: req.body.firstName,
        last_name: req.body.lastName,
        location: req.body.location,
        email: req.body.email,
        phone: req.body.phone,
        date_of_birth: req.body.dateOfBirth,
        password: req.body.password
      }
    });
      } catch (error) {
    console.log(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Replace with a strong secret in your .env or config
exports.deleteUser = async (req, res) => {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const [result] = await db.execute("DELETE FROM users WHERE user_id = ?", [user_id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};


exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Get user by email
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = rows[0];

    // Compare password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 1️⃣ Fetch *all* users
exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT 
         user_id,
         first_name,
         last_name,
         date_of_birth,
         location,
         email,
         phone,
         created_at
       FROM users`
    );
    return res.json(rows);
  } catch (error) {
    console.error('getAllUsers error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// 2️⃣ Fetch *all users’ genre‐prefs* and package together with top_m & top_n
exports.getUserPreferences = async (req, res) => {
  try {
    // a) grab just the IDs
    const [users] = await db.execute(`SELECT user_id FROM users`);
    const userIds = users.map(u => u.user_id);
    if (userIds.length === 0) {
      return res.json({
        user_preferences: [],
        top_m_genres: 6,
        top_n_books: 3
      });
    }

    // b) fetch each user’s genres as a comma‐string
    const [prefs] = await db.query(
      `SELECT 
         ug.user_id,
         GROUP_CONCAT(g.name ORDER BY g.name SEPARATOR ',') AS genres
       FROM user_genres ug
       JOIN genres       g ON ug.genre_id = g.genre_id
       WHERE ug.user_id IN (?)
       GROUP BY ug.user_id`,
      [userIds]
    );

    // c) map back so every user_id is represented (even if no prefs → empty string)
    const prefMap = prefs.reduce((m, row) => {
      m[row.user_id] = row.genres;
      return m;
    }, {});
    const user_preferences = userIds.map(id => ({
      user_id: id,
      genres: prefMap[id] || ''
    }));

    // d) attach your top-M / top-N (hard-coded here, but you could pull from req.query)
    return res.json({
      user_preferences,
      top_m_genres: 6,
      top_n_books: 3
    });
  } catch (error) {
    console.error('getUserPreferences error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
