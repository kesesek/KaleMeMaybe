const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
require('dotenv').config(); 
const pool = require("../data/database.js")


async function updateUsersWithHashedPasswords() {

  const users = [
    { id: 1, name: "John Doe", password: "secure123", email: "john@example.com" },
    { id: 2, name: "Jane Doe", password: "password456", email: "jane@example.com" },
    { id: 3, name: "Alice Johnson", password: "mypassword789", email: "alice@example.com" },
    { id: 4, name: "Bob Smith", password: "testpassword101", email: "bob@example.com" },
    { id: 5, name: "Carol Taylor", password: "hellopassword123", email: "carol@example.com" }
  ];

  try {
    await Promise.all(
      users.map(async (user) => {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const connection = await pool.getConnection();
        try {
          const [results] = await connection.execute(
            "UPDATE user SET encrypted_password = ? WHERE email = ?",
            [hashedPassword, user.email]
          );
          console.log(`Password updated successfully for ${user.name}.`);
        } finally {
          connection.release();
        }
      })
    );
  } catch (err) {
    console.error("Error updating user:", err.message);
  }
}

updateUsersWithHashedPasswords();