from flask import Flask, request, jsonify
from urllib.parse import urlparse
from dotenv import load_dotenv
from newspaper import Article
import requests
import google.generativeai as genai
from flask_cors import CORS
import os
import requests
from bs4 import BeautifulSoup
import json
from youtube_transcript_api import YouTubeTranscriptApi

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
CORS(app, resources={r"/api/*": {"origins": "*"}})

#Enable CORS for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# ----------------------------
# Parse recipe from URL
# ----------------------------
@app.route('/parse', methods=['POST'])
def parse_recipe():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({"error": "No URL provided"}), 400

    # Handle YouTube URLs first
    if 'youtube.com' in url or 'youtu.be' in url:
        video_id = parse_youtube_url(url)
        if not video_id:
            return jsonify({"error": "Invalid YouTube URL"}), 400
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            full_text = " ".join([t['text'] for t in transcript])

            prompt = f"""
            Extract recipe information from this YouTube transcript.
            Return JSON with keys: title, ingredients (list), instructions (list)
            Transcript: {full_text}
            """
            recipe_json = genai.chat.create(
                model ="gemini-2.5",
                messages=[{"role": "user", "content": prompt}]
            )

            content = recipe_json.last["content"]["text"]
            try:
                recipe_data = json.loads(content)
            except:
                recipe_data = {"title": None, "ingredients": [], "instructions": []}
            return jsonify(recipe_data)
        
        except Exception as e:
            return jsonify({"error": f"Failed to fetch YouTube transcript: {e}"}), 500
        
    # Handle normal recipe/article URLs
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/58.0.3029.110 Safari/537.3"
            )
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        content = response.text

        soup = BeautifulSoup(content, 'html.parser')
        scripts = soup.find_all('script', type='application/ld+json')

        if scripts:
            for script in scripts:
                try:
                    data = json.loads(script.string)
                    if isinstance(data, list):
                        for entry in data:
                            if entry.get("@type") == "Recipe":
                                data = entry
                                break

                    if data.get("@type") == "Recipe":
                        recipe = {
                            "title": data.get("name"),
                            "ingredients": data.get("recipeIngredient", []),
                            "instructions": []
                        }

                        if isinstance(data.get("recipeInstructions"), list):
                            for step in data["recipeInstructions"]:
                                if isinstance(step, dict) and "text" in step:
                                    recipe["instructions"].append(step["text"])
                                elif isinstance(step, str):
                                    recipe["instructions"].append(step)
                        elif isinstance(data.get("recipeInstructions"), str):
                            recipe["instructions"] = [data["recipeInstructions"]]

                        return jsonify(recipe)
                except Exception as e:
                    print("JSON-LD parsing error:", e)
# --- Manual scraping if above fails ---
        recipe = {"title": None, "ingredients": [], "instructions": []}

        # Title
        title_tag = soup.find('h1')
        if title_tag:
            recipe["title"] = title_tag.get_text(strip=True)

        # Ingredients and Instructions
        ingredient_tags = soup.find_all(lambda tag: tag.name == "li" and "ingredient" in (tag.get("class") or []))
        for tag in ingredient_tags:
            text = tag.get_text(strip=True)
            if text:
                recipe["ingredients"].append(text)

        
        instruction_tags = soup.find_all(lambda tag: tag.name == "li" and ("instruction" in (tag.get("class") or []) or "direction" in (tag.get("class") or [])))
        for tag in instruction_tags:
            text = tag.get_text(strip=True)
            if text:
                recipe["instructions"].append(text)

        if recipe["title"] or recipe["ingredients"] or recipe["instructions"]:
            return jsonify(recipe)

        # If everything fails
        return jsonify({
            "title": "No structured data found",
            "text": "Structured recipe info could not be extracted."
        })


    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


        
def parse_youtube_url(url):
    parsed_url = urlparse(url)
    if 'youtube.com' in parsed_url.netloc:
        from urllib.parse import parse_qs
        query = parse_qs(parsed_url.query)
        return query.get('v', [None])[0]
    elif 'youtu.be' in parsed_url.netloc:
        return parsed_url.path.lstrip('/')
    else:
        return None

# Search recipes

@app.route('/search', methods=['GET'])
def search_recipes():
    query = request.args.get('query')
    if not query:
        return jsonify({"error": "Missing 'query' parameter"}), 400

    # Perform search logic using Spoonacular API
    spoonacular_url = f"https://api.spoonacular.com/recipes/complexSearch"
    spoonacular_params = {
        "apiKey": SPOONACULAR_API_KEY,
        "query": query,
        "number": 10
    }
    spoonacular_response = requests.get(spoonacular_url, params=spoonacular_params)
    if spoonacular_response.ok:
        spoonacular_data = spoonacular_response.json()
        return jsonify(spoonacular_data)
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
        return jsonify({"error": "Failed to fetch search results"}), 500


if __name__ == '__main__':
    app.run(port=3002, debug=True)