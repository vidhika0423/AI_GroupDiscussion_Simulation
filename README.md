# AI_GroupDiscussion_Simulation
An AI-powered Group Discussion Assistant that transcribes speech, generates contextual responses, and provides detailed analytical feedback using a fine-tuned Mistral model with LoRA. Built with FastAPI backend, React frontend, and integrates speech-to-text (AssemblyAI) and text-to-speech (ElevenLabs) services.
1. Custom Fine-Tuning of Mistral Using LoRA for Dialogue Analysis
Objective: Adapt a general-purpose language model (Mistral) to specifically understand, analyze, and evaluate group discussion dialogues.
Subpoints:
•	Why LoRA:
o	LoRA (Low-Rank Adaptation) allows fine-tuning of large language models efficiently by updating small low-rank matrices.
o	Significantly reduces computational requirements in terms of memory and processing power, making it practical for deployment on limited hardware.
•	Training Dataset:
o	Created a structured dataset of group discussion dialogues.
o	Each entry included:
	The speaker’s dialogue.
	Five detailed evaluation metrics (e.g., content relevance, logical flow, depth of argument, communication clarity, vocabulary).
	Reasons for the given scores.
	Suggestions for improvement.
o	Custom preprocessing combined speaker-dialogue pairs with corresponding structured outputs.
•	Training Pipeline:
o	Utilized Hugging Face Transformers, peft (for LoRA), and bitsandbytes (bnb) for 4-bit quantization to reduce memory usage.
o	LoRA adapters were injected into the Mistral model’s transformer layers.
o	Trained with a focus on generating structured JSON outputs that follow the specified evaluation format.
o	Optimized with gradient checkpointing and mixed precision for better efficiency.
________________________________________
2. How the Fine-Tuned Model Powers the GD System
Objective: Enable real-time group discussion participation and feedback with meaningful, human-like responses from the AI.
Subpoints:
•	Response Generation:
o	Model generates context-aware replies for simulated group discussions.
o	Responses are generated based on the ongoing discussion and topic provided.
o	The style of output mimics a human participant with opinions, reasoning, and arguments.
•	Dialogue Analysis:
o	Each user dialogue is passed through a dedicated prompt designed to extract structured feedback.
o	Model generates complete JSON outputs containing:
	Evaluation scores for different metrics.
	Specific reasons for each score.
	Actionable improvement suggestions.
o	Entire evaluation is learned behavior from the fine-tuned model, requiring no external templates or logic rules.
•	Efficiency:
o	LoRA fine-tuning ensures that the full model runs efficiently on local machines with or without GPUs.
o	Suitable for real-time use in interactive applications.
________________________________________
3. Seamless Integration with Speech and Web Technologies for Real GD Simulations
Objective: Provide an interactive, user-friendly, and speech-enabled system for realistic GD simulations.
Subpoints:
•	Speech-to-Text (STT):
o	Integrated with AssemblyAI API for converting spoken audio input to text.
o	Enables users to actively participate in GD using their voice instead of typing.
•	Text-to-Speech (TTS):
o	Integrated ElevenLabs API for generating natural-sounding speech from AI-generated text.
o	Makes AI participation in the discussion feel more engaging and interactive for users.
•	FastAPI Backend:
o	Acts as the core API for coordinating all operations:
	Handles audio uploads.
	Converts speech to text.
	Generates contextual GD responses using the fine-tuned Mistral model.
	Provides real-time analysis of user dialogues on request.
	Converts responses back to audio for output.
o	Built with CORS enabled to easily integrate with web-based or mobile frontends.

