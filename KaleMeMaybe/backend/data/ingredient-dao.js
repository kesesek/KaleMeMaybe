const SQL = require("sql-template-strings");
const pool = require("./database.js");

// Query ingredients by prefix.
async function queryIngredients(prefix) {
  let db;
  try {
    db = await pool.getConnection();

    const query = SQL`SELECT id, name FROM ingredient WHERE LOWER(name) LIKE ${
      "%" + prefix.toLowerCase() + "%"
    } ORDER BY name`;
    const ingredients = await db.execute(query);
    return ingredients;
  } finally {
    if (db) db.release();
  }
}

// Export functions.
module.exports = {
  queryIngredients,
};
