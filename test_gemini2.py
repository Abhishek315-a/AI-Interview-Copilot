import os
from dotenv import load_dotenv
load_dotenv()
from langchain_google_genai import GoogleGenerativeAIEmbeddings

api_key = os.getenv("GEMINI_API_KEY")

try:
    print("Testing 'models/gemini-embedding-001'")
    emb = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001", google_api_key=api_key)
    res = emb.embed_query("hello")
    print(f"Success! Dimension: {len(res)}")
except Exception as e:
    print(f"Failed: {e}")
