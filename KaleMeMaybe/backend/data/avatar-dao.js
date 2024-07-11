const SQL = require("sql-template-strings");
const pool = require("./database.js");

// retrieve avatar by image path
async function retrieveAvatarByPath(avatarPath) {
  let db;
  try {
    db = await pool.getConnection();

    const [avatar] = await db.execute(
      SQL`SELECT * FROM avatar WHERE image_path = ${avatarPath}`
    );

    return avatar[0];
  } finally {
    if (db) db.release();
  }
}

// Export functions.
module.exports = {
  retrieveAvatarByPath,
};