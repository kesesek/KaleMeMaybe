const SQL = require("sql-template-strings");
const pool = require("./database.js");
const { addAverageScore, addPopularity } = require("./recipe-dao.js");

// Retrieve data of user's favorites
async function getFavorites(user) {
  let db;

  try {
    db = await pool.getConnection();

    const [collections] = await db.query(
      `
        SELECT 
            c.id,
            c.name AS CollectionName,
            COUNT(cr.recipe_id) AS RecipeCount,
            COALESCE((
                SELECT r.image_path
                FROM recipe r
                JOIN collection_recipe cr ON cr.recipe_id = r.id
                WHERE cr.collection_id = c.id
                ORDER BY r.created_at DESC
                LIMIT 1
            ), '/generated-images/nothingHere.jpg') AS LatestRecipeImagePath,
            c.updated_at AS CollectionUpdatedAt
        FROM 
            collection c
        LEFT JOIN 
            collection_recipe cr ON c.id = cr.collection_id
        WHERE 
            c.user_id = ?
        GROUP BY 
            c.id
        ORDER BY 
            c.updated_at DESC
    `,
      [user]
    );

    return collections;
  } catch (error) {
    console.error("Database error: ", error);
  } finally {
    if (db) db.release();
  }
}

async function createCollection(user, collectionName) {
  let db;

  try {
    db = await pool.getConnection();

    const [userCheck] = await db.query(`SELECT id FROM user WHERE id = ?`, [
      user,
    ]);
    if (userCheck.length === 0) {
      throw new Error("User does not exist");
    }

    await db.query(
      `
      INSERT INTO collection (name, user_id, created_at, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
    `,
      [collectionName, user]
    );

    const collections = await getFavorites(user);
    return collections;
  } catch (error) {
    console.error("Database error: ", error);
    throw error;
  } finally {
    if (db) db.release();
  }
}

// async function searchFavorites(user, searchTerm) {
//   let db;

//   try {
//     db = await pool.getConnection();

//     const [userCheck] = await db.query(`SELECT id FROM user WHERE id = ?`, [
//       user,
//     ]);
//     if (userCheck.length === 0) {
//       throw new Error("User does not exist");
//     }

//     const [rows] = await db.query(
//       `
//       SELECT DISTINCT r.*, TRUE as favouriteState
//       FROM collection c
//       JOIN collection_recipe cr ON c.id = cr.collection_id
//       JOIN recipe r ON cr.recipe_id = r.id
//       WHERE c.user_id = ? 
//       AND (
//           r.name LIKE CONCAT('%', ?, '%') OR 
//           r.ingredient_details LIKE CONCAT('%', ?, '%') OR 
//           r.method LIKE CONCAT('%', ?, '%')
//       )
//     `,
//       [user, searchTerm, searchTerm, searchTerm]
//     );

//     return rows;
//   } catch (error) {
//     console.error("Database error: ", error);
//     throw error;
//   } finally {
//     if (db) db.release();
//   }
// }

async function searchFavorites(user, searchTerm) {
  let db;

  try {
    db = await pool.getConnection();

    const [userCheck] = await db.query(`SELECT id FROM user WHERE id = ?`, [user]);
    if (userCheck.length === 0) {
      throw new Error("User does not exist");
    }

    const [rows] = await db.query(
      `
      SELECT DISTINCT r.*, TRUE as favouriteState
      FROM collection c
      JOIN collection_recipe cr ON c.id = cr.collection_id
      JOIN recipe r ON cr.recipe_id = r.id
      WHERE c.user_id = ? 
      AND (
          r.name LIKE CONCAT('%', ?, '%') OR 
          r.ingredient_details LIKE CONCAT('%', ?, '%') OR 
          r.method LIKE CONCAT('%', ?, '%')
      )
    `,
      [user, searchTerm, searchTerm, searchTerm]
    );

    // Fetch average scores
    const [averageScores] = await db.query(
      `
      SELECT r.id, AVG(IFNULL(s.score, NULL)) AS averageScore
      FROM recipe r
      LEFT JOIN score s ON r.id = s.recipe_id
      GROUP BY r.id;
    `
    );

    // Fetch popularity scores
    const [popularityScores] = await db.query(
      `
      SELECT r.id, COALESCE(c.popularity, 0) AS popularity
      FROM recipe r
      LEFT JOIN (
          SELECT recipe_id, COUNT(*) AS popularity
          FROM collection_recipe
          GROUP BY recipe_id
      ) c ON r.id = c.recipe_id;
    `
    );

    // Create a map for averageScores and popularityScores
    const averageScoreMap = new Map(averageScores.map(item => [item.id, item.averageScore]));
    const popularityScoreMap = new Map(popularityScores.map(item => [item.id, item.popularity]));

    // Add rate and popularity to the recipes
    const recipesWithScores = rows.map(recipe => ({
      ...recipe,
      rate: averageScoreMap.get(recipe.id) || 0,
      popularity: popularityScoreMap.get(recipe.id) || 0
    }));

    return recipesWithScores;

  } catch (err) {
    console.error("Error searching favorites:", err);
    throw err;
  } finally {
    if (db) db.release();
  }
}

// Export functions.
module.exports = {
  getFavorites,
  createCollection,
  searchFavorites,
};
