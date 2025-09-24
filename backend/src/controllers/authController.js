const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/db");

exports.login = async (req, res) => {
  const { email, password, role: expectedRole } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide an email and password" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request().input("email", sql.VarChar, email)
      .query(`
        SELECT u.*, r.name as roleName 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = @email
      `);

    const user = result.recordset[0];

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ message: "invalid_credentials_or_inactive" }); // Changed
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      // This is the main "Invalid credentials" message
      return res.status(401).json({ message: "invalid_credentials" }); // Changed
    }

    if (expectedRole && user.roleName !== expectedRole) {
      // This is the "Access denied" message
      return res.status(403).json({
        message: "access_denied", // Changed
      });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, role: user.roleName, userId: user.id });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.registerStore = async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    storeName,
    storeAddress,
    storeCity,
    storeNotes,
  } = req.body;
  try {
    const pool = await poolPromise;
    const existingUser = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");
    if (existingUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    try {
      const storeResult = await new sql.Request(transaction)
        .input("name", sql.VarChar, storeName)
        .input("contact_name", sql.VarChar, name) // Assuming the registrant is the contact
        .input("contact_phone", sql.VarChar, phone) // Assuming registrant's phone is contact phone
        .input("address", sql.Text, storeAddress)
        .input("city", sql.VarChar, storeCity)
        .input("notes", sql.Text, storeNotes)
        .query(
          "INSERT INTO stores (name, contact_name, contact_phone, address, city, notes) OUTPUT INSERTED.id VALUES (@name, @contact_name, @contact_phone, @address, @city, @notes)"
        );
      const storeId = storeResult.recordset[0].id;
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      const roleResult = await new sql.Request(transaction).query(
        "SELECT id FROM roles WHERE name = 'customer'"
      );
      const storeRoleId = roleResult.recordset[0].id;
      await new sql.Request(transaction)
        .input("name", sql.VarChar, name)
        .input("email", sql.VarChar, email)
        .input("password_hash", sql.Text, password_hash)
        .input("role_id", sql.Int, storeRoleId)
        .input("store_id", sql.UniqueIdentifier, storeId)
        .input("phone", sql.VarChar, phone)
        .query(
          "INSERT INTO users (name, email, password_hash, role_id, store_id, status, phone) VALUES (@name, @email, @password_hash, @role_id, @store_id, 'pending', @phone)"
        );
      await transaction.commit();
      res.status(201).json({
        message:
          "Registration successful! Your account is pending admin approval.",
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    res.status(500).json({ message: "Server error during registration." });
  }
};
exports.forgotPassword = async (req, res) => {
  console.log("Forgot password request for:", req.body.email);
  res.status(200).json({
    message:
      "If an account with that email exists, a password reset link has been sent.",
  });
};
