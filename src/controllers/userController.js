const bcrypt = require("bcrypt");
const db = require("../config/db"); // your MySQL2 connection
const saltRounds = 10;
const {v4:uuidv4} = require("uuid")

exports.createUser = async (req, res) => {
  const { first_name, last_name, date_of_birth, email, phone, password } = req.body;
  console.log(req)

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'Required fields missing' });
  }

  try {
    const user_id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await db.execute(
      `INSERT INTO users (user_id, first_name, last_name, date_of_birth, email, phone, password)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, first_name, last_name, date_of_birth, email, phone, hashedPassword]
    );

    res.status(201).json({ message: 'User created', user_id });
  } catch (error) {
    console.log(error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Replace with a strong secret in your .env or config

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
