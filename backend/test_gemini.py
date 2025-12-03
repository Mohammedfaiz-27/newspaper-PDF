"""
Test script to check Gemini API and available models
"""
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')

if not api_key or api_key == 'your_gemini_api_key_here':
    print("❌ ERROR: GEMINI_API_KEY not set in .env file")
    print("Please add your actual Gemini API key to backend/.env")
    exit(1)

print(f"✓ API Key found: {api_key[:10]}...")

try:
    genai.configure(api_key=api_key)
    print("✓ Gemini API configured successfully")

    print("\n📋 Available Models:")
    print("-" * 60)

    for model in genai.list_models():
        if 'generateContent' in model.supported_generation_methods:
            print(f"✓ {model.name}")
            print(f"  Display Name: {model.display_name}")
            print(f"  Description: {model.description[:100]}...")
            print()

    print("\n🧪 Testing a model...")
    print("-" * 60)

    # Try different model names
    model_names = [
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro'
    ]

    for model_name in model_names:
        try:
            print(f"\nTrying: {model_name}")
            model = genai.GenerativeModel(model_name)
            response = model.generate_content("Say hello")
            print(f"✓ SUCCESS with {model_name}")
            print(f"Response: {response.text}")
            break
        except Exception as e:
            print(f"✗ Failed: {str(e)[:100]}")

except Exception as e:
    print(f"\n❌ Error: {e}")
    print("\nPossible issues:")
    print("1. Invalid API key")
    print("2. API key doesn't have proper permissions")
    print("3. Need to upgrade google-generativeai library")
    print("\nTo fix:")
    print("pip install --upgrade google-generativeai")
