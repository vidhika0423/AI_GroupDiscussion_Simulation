
 # AI Group Discussion Simulation

An AI-powered application that simulates and analyzes group discussions using a fine-tuned Large Language Model (Mistral) with LoRA. The project features a FastAPI backend, a React frontend, and integrates speech-to-text and text-to-speech capabilities for a seamless, real-time GD experience.

## Features

- Real-time **speech-to-text transcription** using AssemblyAI
- Fine-tuned **Mistral LLM** generating human-like GD responses
- **Text-to-speech output** using ElevenLabs API
- Detailed **GD response analysis** with structured feedback in JSON
- Modern **React frontend (Vite)** for interactive UI
- Complete **fine-tuning code** and dataset for customization

## Fine-Tuning Process

1. **Model Choice and Dataset**
   - Used `Mistral-7B-Instruct` as the base language model
   - Dataset of GD prompts, ideal responses, and analysis guidelines in CSV format

2. **Training Approach**
   - Fine-tuned using **LoRA (Low-Rank Adaptation)** for parameter-efficient tuning
   - Utilized Hugging Face’s `transformers`, `peft`, and `accelerate` libraries
   - Optimized using `8-bit` quantization to manage resource consumption

3. **Deployment**
   - Fine-tuned model loaded in the **FastAPI backend**
   - **Custom prompts** designed to guide the AI in generating context-aware GD responses
   - Integrated **analysis prompt template** for generating structured feedback on user dialogues

## Usage

1. **Frontend**
   - Upload your speech for the GD session
   - Receive AI-generated responses and audio output
   - Navigate to the analysis section for feedback

2. **Backend**
   - Accepts audio files, generates transcripts
   - Generates AI responses and structured analysis reports

3. **Fine-Tuning**
   - Modify `fintunning.py` to further tune or retrain the model with new datasets
   - Use `dataset.csv` to expand or modify training data

## Technologies Used

- FastAPI
- React (Vite)
- Hugging Face Transformers
- PEFT & LoRA
- AssemblyAI API
- ElevenLabs API
- PyTorch
![page1](https://github.com/user-attachments/assets/02ee355c-6877-4134-adcb-1bfb15457da0)

![dashboard](https://github.com/user-attachments/assets/06b98ab8-a517-4287-982f-77f4787be833)

![gdRoom](https://github.com/user-attachments/assets/07f65aef-3ed7-4f5f-8817-6ea90d313ab4)

![analysis](https://github.com/user-attachments/assets/b09ae2c5-e562-4969-a381-9ba8391c9d18)




