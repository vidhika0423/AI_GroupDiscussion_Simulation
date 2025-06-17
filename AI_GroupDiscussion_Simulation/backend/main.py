from fastapi import FastAPI, UploadFile, File, Form, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
import requests
import uuid
import assemblyai as aai
import os
import requests
from playsound import playsound
import pyttsx3
import pyttsx3
from pydub import AudioSegment
from pydub.playback import play



# Configuration
# ASSEMBLY_AI_KEY = "API_KEY"
# ELEVEN_LABS_API_KEY = "API_KEY"
# ELEVEN_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"
# UPLOAD_DIR = "uploads"

if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Loading Mistral model
model_path = "C:\\Users\\HP\\OneDrive\\Documents\\GrpDiscussion\\fine_tuned_mistral_gd_merged"
tokenizer = AutoTokenizer.from_pretrained(model_path)
tokenizer.pad_token = tokenizer.eos_token
model = AutoModelForCausalLM.from_pretrained(model_path)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

# Seting up AssemblyAI
aai.settings.api_key = ASSEMBLY_AI_KEY

# FastAPI Setup 
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def transcribe_audio(file_path):
    try:
        transcriber = aai.Transcriber()
        transcript = transcriber.transcribe(file_path)
        return transcript.text.strip()
    except Exception as e:
        return f"STT Error: {e}"

def generate_gd_response(dialogue_history, topic="AI", max_length=1024):
    prompt = f"""
You are a human participant in a group discussion. Your role is to contribute to the conversation naturally and constructively.

    ### Topic of Discussion:
    "{topic}"

    ### Conversation So Far:
    "{dialogue_history}"

    ### Your Turn to Speak:
    Respond to the above conversation with 3–6 well-thought-out sentences. 
    - Stay on topic.
    - Present your own point of view, agree/disagree respectfully.
    - Support your thoughts with logic, reasoning, or examples.
    - Do not act like an AI or analyzer. Be engaging and human.

    Begin your response now:
"""
    inputs = tokenizer(prompt, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    with torch.no_grad():
        output = model.generate(**inputs, max_new_tokens=256, temperature=0.7, top_p=0.9, repetition_penalty=1.1, do_sample=True)
    decoded = tokenizer.decode(output[0], skip_special_tokens=True)
    return decoded.split("Your turn:")[-1].strip()


def text_to_speech(text, filename="response_audio.mp3"):
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{ELEVEN_VOICE_ID}"
    headers = {
        "xi-api-key": ELEVEN_LABS_API_KEY,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
    }
    data = {
        "text": text,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }

    response = requests.post(url, headers=headers, json=data)

    if response.status_code == 200:
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(response.content)
        print(f"TTS audio saved to {file_path}")

        
        try:
            playsound(file_path)
        except Exception as e:
            print(f"Error playing audio: {e}")

        return file_path
    else:
        print(f"TTS API Error: {response.status_code} - {response.text}")
        return None




user_responses=[]

def generate_gd_analysis( dialogue, max_length=1024):
    prompt_template = f"""
You are an AI trained to analyze group discussion responses.

Given the speaker and their dialogue, return a detailed analysis **strictly** in the JSON format below.

🔸 Do not leave any field blank.
🔸 Give a reason for every score.
🔸 Provide specific, actionable improvements for each criterion.

Use this format:

{{
  "speaker": "<name>",
  "dialogue": "<dialogue>",
  "content_relevance": <score>,
  "logical_flow": <score>,
  "depth_of_argument": <score>,
  "communication_clarity": <score>,
  "vocabulary_and_language": <score>,
  "reason_content_relevance": "<reason>",
  "reason_logical_flow": "<reason>",
  "reason_depth_of_argument": "<reason>",
  "reason_communication_clarity": "<reason>",
  "reason_vocabulary_and_language": "<reason>",
  "improvement_content_relevance": "<suggestion>",
  "improvement_logical_flow": "<suggestion>",
  "improvement_depth_of_argument": "<suggestion>",
  "improvement_communication_clarity": "<suggestion>",
  "improvement_vocabulary_and_language": "<suggestion>"
}}

### Input:

Dialogue: "{dialogue}"

### Output:
Return your output only in JSON format.
"""
    inputs = tokenizer(prompt_template, return_tensors="pt", padding=True, truncation=True, max_length=max_length)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        output = model.generate(
            **inputs,
            max_new_tokens=1024,
            temperature=0.5,
            top_p=0.8,
            repetition_penalty=1.2,
            do_sample=True
        )

    decoded = tokenizer.decode(output[0], skip_special_tokens=True)

    # Extract JSON from output
    try:
        json_part = decoded[decoded.index("{"):decoded.rindex("}")+1]
    except ValueError:
        json_part = "{}"

    return json_part

from pydantic import BaseModel
from typing import List
import json

class DialogueRequest(BaseModel):
    speaker: str
    userResponses: List[str]

def clean_analysis(raw_list):
    cleaned_data = []
    for item in raw_list:
        try:
            # Split on the specific marker
            parts = item.split("Return your output only in JSON format.\n\n```json")
            if len(parts) > 1:
                # Extract JSON block before closing ```
                json_str = parts[1].split("```")[0].strip()
                data = json.loads(json_str)
                cleaned_data.append(data)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON: {e}")
            continue
    return cleaned_data


@app.post("/analysis")
async def analyze_gd(request: DialogueRequest):
    analysis_results = []
    for dialogue in request.userResponses:
        analysis = generate_gd_analysis(dialogue)
        # analysis = clean_analysis(analysis)
        print(analysis)
        analysis_results.append(analysis)
    return {"analysis": analysis_results}





@app.post("/gd/")
async def full_pipeline(audio: UploadFile = File(...), topic: str = Form(...), history: str = Form(...)):
    try:
        print("Starting audio file save...")
        file_path = os.path.join(UPLOAD_DIR, f"{uuid.uuid4()}.wav")
        with open(file_path, "wb") as f:
            f.write(await audio.read())
        
        print(f"Audio file saved at: {file_path}")

        # Transcribe audio
        print("Starting transcription...")
        user_text = transcribe_audio(file_path)
        print(f"User transcription: {user_text}")

        user_responses.append(user_text)


        # If history is undefined or empty, initialize with an empty conversation
        if not history or history == "undefined":
            history = "Start of the conversation"

        # Generate response based on history
        new_history = f"{history}\nYou: {user_text}"
        print(f"Generating response for: {new_history}")
        full_bot_response = generate_gd_response(new_history, topic)
        bot_text = full_bot_response.split("Begin your response now:")[-1].strip()
        print(f"Bot response: {bot_text}")
        print("text to speech")
        text_to_speech(bot_text)
        # Return both user and bot responses
        return JSONResponse(
            content={"user_response": user_text, "bot_response": bot_text},
            status_code=200
        )

    except Exception as e:
        print(f"Error during GD processing: {str(e)}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/")
async def root():
    return {"message": "Unified Group Discussion Bot API running."}


