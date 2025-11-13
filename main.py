import os
from google import genai
from google.genai import types


statement = "Please analyze wether the following statement is true or false. Think wisely and deeply. Your response should ONLY be a 'T' or an 'F'. "
statement = statement + input("Enter your statement: ")

client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])
config = types.GenerateContentConfig()

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=statement,
    config=config,
)

# Print the final, user-facing response
print(response.text)
