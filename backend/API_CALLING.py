import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

api_key = os.getenv("AI_API_KEY") or os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("AI_API_KEY / GEMINI_API_KEY is missing from backend/.env")

client = genai.Client(
    api_key=api_key,
    http_options=types.HttpOptions(timeout=30000),
)

try:
    print("Calling Gemini API...")
    response = client.models.generate_content(
        model=os.getenv("AI_MODEL", "gemini-1.5-flash"),
        contents="Explain Python in simple words.",
    )
    print("\nResponse:")
    print(response.text)
except Exception as e:
    print(f"\nGemini API error: {e}")