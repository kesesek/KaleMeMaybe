const express = require("express");
const router = express.Router();
const {
  generateRecipeWithIngredients,
  generateRecipeImage,
} = require("../data/ai-recipe-generator");

const {
  retrieveRecipeById,
  insertRecipeAndSearchHistory,
} = require("../data/recipe-dao");

// test api health
router.get("/health", async (req, res) => {
  res.status(200).send("API is healthy!");
});

// recipe generator
router.post("/recipes", async (req, res) => {
  const { ingredients } = req.body;
  const { user_id } = req.body;

  // already genrated recipe name
  const { existing_recipe_name } = req.body;

  // check if ingredients list is empty
  if (!ingredients || ingredients.length === 0) {
    return res
      .status(400)
      .json({ error: "Ingredients list is required and cannot be empty." });
  }

  const ingredientNames = ingredients.map((ingredient) => ingredient.name);

  try {
    // generate recipe with ingredients
    const recipeData = await generateRecipeWithIngredients(
      ingredientNames,
      existing_recipe_name
    );
    const recipe = JSON.parse(recipeData);

    // generate image using the recipe name
    const image_path = await generateRecipeImage(recipe);

    // store recipe data in database
    const recipeId = await insertRecipeAndSearchHistory(
      recipe,
      image_path,
      user_id,
      ingredients
    );

    res
      .status(200)
      .json({ recipeId: recipeId, recipe: recipe, image_path: image_path });
  } catch (error) {
    console.error("Error generating recipe:", error);
    res.status(500).json({ error: "Failed to generate." });
  }
});

// get recipe by id
router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;
  const userid = req.headers["userid"];

  try {
    const result = await retrieveRecipeById(userid, id);
    if (result && result.recipe) {
      res.status(200).json(result);
    } else {
      res.status(404).json({ error: "Recipe not found" });
    }
  } catch (error) {
    console.error("Error fetching recipe:", error);
    res.status(500).json({ error: "Failed to fetch recipe." });
  }
});

module.exports = router;
