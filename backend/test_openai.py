import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
# Make sure your GEMINI_API_KEY is set in your environment variables
# You can set it like this in your terminal (Windows PowerShell):
# $env:GEMINI_API_KEY="your_api_key_here"
# or in CMD:
# set GEMINI_API_KEY=your_api_key_here

# Load the API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("⚠️ GEMINI_API_KEY not found. Please set it in your environment variables.")

# Configure Gemini
genai.configure(api_key=api_key)

# Create a model instance
model = genai.GenerativeModel("gemini-2.5-flash")

# Send a simple test prompt
prompt = "Give me a random fun fact about space."

try:
    response = model.generate_content(prompt)
    print("✅ Gemini API Response:")
    print(response.text)

except Exception as e:
    print("❌ Error calling Gemini API:")
    print(e)
