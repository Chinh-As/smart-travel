from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    client = genai.Client(api_key=api_key)
    models = client.models.list()
    for m in models:
        print(m.name, m.supported_actions)
except Exception as e:
    print("Error:", e)
