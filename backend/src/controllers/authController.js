const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { poolPromise, sql } = require("../config/db");

exports.login = async (req, res) => {
  const { identifier, password, role: expectedRole } = req.body;

  if (!identifier || !password) {
    return res
      .status(400)
      .json({ message: "Please provide an identifier and password" });
  }

  try {
    const isEmail = identifier.includes("@");
    const queryField = isEmail ? "u.email" : "u.user_id";

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("identifier", isEmail ? sql.VarChar : sql.Int, identifier).query(`
        SELECT u.*, r.name as roleName 
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE ${queryField} = @identifier
      `);

    const user = result.recordset[0];

    if (!user || user.status !== "active") {
      return res
        .status(401)
        .json({ message: "invalid_credentials_or_inactive" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ message: "invalid_credentials" });
    }

    if (expectedRole && user.roleName !== expectedRole) {
      return res.status(403).json({
        message: "access_denied",
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

// --- THIS IS THE UPDATED FUNCTION ---
exports.registerStore = async (req, res) => {
  const {
    name, // User's full name
    email,
    password,
    phone,
    storeName,
    storeAddress,
    storeCity,
    storeNotes,
  } = req.body;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    // Check if the user's email already exists
    const existingUser = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT id FROM users WHERE email = @email");
    if (existingUser.recordset.length > 0) {
      return res
        .status(400)
        .json({ message: "An account with this email already exists." });
    }

    await transaction.begin();

    // 1. Create the User First
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);
    const roleResult = await new sql.Request(transaction).query(
      "SELECT id FROM roles WHERE name = 'customer'"
    );
    const customerRoleId = roleResult.recordset[0].id;

    // Insert user and get back their new IDs
    const userResult = await new sql.Request(transaction)
      .input("name", sql.VarChar, name)
      .input("email", sql.VarChar, email)
      .input("password_hash", sql.Text, password_hash)
      .input("role_id", sql.Int, customerRoleId)
      .input("phone", sql.VarChar, phone)
      .query(
        "INSERT INTO users (name, email, password_hash, role_id, phone, status) OUTPUT INSERTED.id, INSERTED.user_id VALUES (@name, @email, @password_hash, @role_id, @phone, 'pending')"
      );

    const newUserId_guid = userResult.recordset[0].id; // The uniqueidentifier for linking
    const newUserId_sequential = userResult.recordset[0].user_id; // The number for login

    // 2. Create the Store and Link It to the New User
    await new sql.Request(transaction)
      .input("name", sql.VarChar, storeName)
      .input("address", sql.Text, storeAddress)
      .input("city", sql.VarChar, storeCity)
      .input("notes", sql.Text, storeNotes)
      .input("user_id", sql.UniqueIdentifier, newUserId_guid) // Link using the user's primary key
      .query(
        "INSERT INTO stores (name, address, city, notes, user_id) VALUES (@name, @address, @city, @notes, @user_id)"
      );

    await transaction.commit();

    res.status(201).json({
      message:
        "Registration successful! Your account is pending admin approval.",
      userId: newUserId_sequential,
    });
  } catch (error) {
    await transaction.rollback();
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
