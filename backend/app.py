import os
from flask import Flask, request, jsonify
from dotenv import load_dotenv
from newspaper import Article
import requests
import google.generativeai as genai
from flask_cors import CORS

# Load environment variables
load_dotenv()

# In-memory storage for saved recipes 
saved_recipes = {"1": {
  "id": "1",
  "title": "Spaghetti Aglio e Olio",
  "description": "A simple and classic Italian spaghetti with garlic, olive oil, and chili flakes.",
  "ingredients": [
    { "name": "spaghetti", "amount": "12", "unit": "oz" },
    { "name": "garlic cloves, thinly sliced", "amount": "4", "unit": "" },
    { "name": "extra virgin olive oil", "amount": "1/3", "unit": "cup" },
    { "name": "red chili flakes", "amount": "1", "unit": "tsp" },
    { "name": "fresh parsley, chopped", "amount": "1/4", "unit": "cup" },
    { "name": "salt", "amount": "to taste", "unit": "" },
    { "name": "grated Parmesan cheese (optional)", "amount": "1/4", "unit": "cup" }
  ],
  "steps": [
    { "order": 1, "instruction": "Bring a large pot of salted water to a boil and cook spaghetti until al dente. Reserve 1/2 cup of pasta water before draining." },
    { "order": 2, "instruction": "In a large skillet, heat olive oil over medium heat. Add garlic slices and chili flakes, cooking until garlic is golden but not burnt." },
    { "order": 3, "instruction": "Add the drained spaghetti to the skillet and toss to coat in the garlic-chili oil. Add reserved pasta water a little at a time if needed to loosen." },
    { "order": 4, "instruction": "Remove from heat, mix in chopped parsley, and season with salt to taste." },
    { "order": 5, "instruction": "Serve hot, optionally topped with grated Parmesan cheese." }
  ],
  "cookingTime": 20,
  "servings": 4,
  "difficulty": "easy",
  "cuisine": "Italian",
  "sourceUrl": "https://example.com/spaghetti-aglio-e-olio",
  "sourceType": "manual",
  "savedBy": [1, 2],
  "tags": ["pasta", "quick", "vegetarian"]
}}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY")

# Configure Gemini API
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

# ----------------------------
# Gemini API route (replaces OpenAI)
# ----------------------------
@app.route('/api/gemini', methods=['POST'])
def gemini_api():
    data = request.get_json()
    prompt = data.get('prompt')

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        return jsonify({"result": response.text})
    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

# ----------------------------
# Get recipe info (Spoonacular)
# ----------------------------
# @app.route('/api/recipe/<int:recipe_id>', methods=['GET'])
# def get_recipe(recipe_id):
#     params = {"apiKey": SPOONACULAR_API_KEY}
#     url = f"https://api.spoonacular.com/recipes/{recipe_id}/information"
#     response = requests.get(url, params=params)
#     if response.ok:
#         print("Spoonacular API response:")
#         print(response.json())
#         return jsonify(response.json())
#     else:
#         return jsonify({"error": "Spoonacular API error"}), 500

# ----------------------------
# Parse recipe from URL
# ----------------------------
@app.route('/parse', methods=['POST'])
def parse_recipe():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    article = Article(url)
    try:
        article.download()
        article.parse()
        return jsonify({
            "title": article.title,
            "text": article.text
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ----------------------------
# Recipe recommendations (Gemini)
# ----------------------------
@app.route('/recommendations', methods=['POST'])
def recommendations():
    data = request.get_json()
    user_input = data.get('user_input')

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = f"Suggest some recipes based on these ingredients: {user_input}"
        response = model.generate_content(prompt)

        suggestions = response.text.strip().split("\n")
        return jsonify({"suggestions": suggestions})
    except Exception as e:
        return jsonify({"error": f"Gemini API error: {str(e)}"}), 500

# ----------------------------
# Search recipes (Spoonacular)
# ----------------------------
@app.route('/api/search', methods=['GET'])
def search_recipes():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400

    url = "https://api.spoonacular.com/recipes/complexSearch"
    params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 10
    }

    spoon_response = requests.get(url, params=params)
    if spoon_response.ok:
        return jsonify(spoon_response.json())
    else:
        return jsonify({"error": "Spoonacular API error"}), 500
    


@app.route('/api/recipes', methods=['GET'], strict_slashes=False)
def list_recipes():
    """Return all saved recipes for browse views."""
    return jsonify(list(saved_recipes.values())), 200


@app.route('/api/recipes', methods=['POST'], strict_slashes=False)
def create_recipe():
    data = request.get_json()
    recipe = data.get("recipeData")

    if not recipe:
        return jsonify({"error": "No recipe data provided"}), 400

    # Generate a simple ID (or use a database ID)
    recipe_id = str(len(saved_recipes) + 1)
    recipe["id"] = recipe_id

    # Save in memory (replace with database in production)
    saved_recipes[recipe_id] = recipe

    return jsonify(recipe), 201


@app.route("/api/recipes/<id>", strict_slashes=False)
def get_recipe(id):
    recipe = saved_recipes.get(id)
    if recipe:
        return jsonify(recipe)
    return jsonify({"error": "Recipe not found"}), 404

if __name__ == '__main__':
    app.run(port=3002, debug=True)
