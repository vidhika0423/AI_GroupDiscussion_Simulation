import torch
import pandas as pd
from datasets import Dataset
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    TrainingArguments,
    Trainer,
    BitsAndBytesConfig
)
from peft import LoraConfig, TaskType, get_peft_model
from accelerate import dispatch_model, infer_auto_device_map

# Loading tokenizer from local path
model_path = "mistralai/Mistral-7B-v0.1"
tokenizer = AutoTokenizer.from_pretrained(model_path)

if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token  

# quantization config to reduce GPU memory usage
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
)

#  Loading model with CPU offloading for low VRAM
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    quantization_config=bnb_config
)


device_map = infer_auto_device_map(
    model,
    max_memory={0: "6GiB", "cpu": "50GiB"} 
)


model = dispatch_model(model, device_map=device_map)

# LoRA Configuration 
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=4,
    lora_alpha=8,
    lora_dropout=0.1
)
model = get_peft_model(model, lora_config)

# Loading CSV Dataset
df = pd.read_csv("/content/drive/MyDrive/processes_analysis_data.csv")


dataset = Dataset.from_pandas(df)

# Preprocessing function
def preprocess_function(examples):
    
    formatted_texts = [f"{spk}: {dlg}" for spk, dlg in zip(examples["speaker"], examples["dialogue"])]

    
    structured_output = [
        f"{cr},{lf},{da},{cc},{vl},{rcr},{rlf},{rda},{rcc},{rvl},{icr},{ilf},{ida},{icc},{ivl}"
        for cr, lf, da, cc, vl, rcr, rlf, rda, rcc, rvl, icr, ilf, ida, icc, ivl in zip(
            examples["content_relevance"], examples["logical_flow"], examples["depth_of_argument"],
            examples["communication_clarity"], examples["vocabulary_and_language"],
            examples["reason_content_relevance"], examples["reason_logical_flow"], examples["reason_depth_of_argument"],
            examples["reason_communication_clarity"], examples["reason_vocabulary_and_language"],
            examples["improvement_content_relevance"], examples["improvement_logical_flow"],
            examples["improvement_depth_of_argument"], examples["improvement_communication_clarity"],
            examples["improvement_vocabulary_and_language"]
        )
    ]

   
    tokenized_inputs = tokenizer(
        formatted_texts,
        padding="max_length",
        truncation=True,
        max_length=512, 
        return_tensors="pt"
    )

   
    with tokenizer.as_target_tokenizer():
        tokenized_labels = tokenizer(
            structured_output,
            padding="max_length",
            truncation=True,
            max_length=512,
            return_tensors="pt"
        )
        
    max_seq_length = tokenized_inputs["input_ids"].shape[1]
    tokenized_labels["input_ids"] = tokenized_labels["input_ids"][:, :max_seq_length]

    # Shift labels for causal language modeling (ignore pad tokens)
    labels = tokenized_labels["input_ids"]
    labels[labels == tokenizer.pad_token_id] = -100  # Ignoring  padding in loss calculation

    tokenized_inputs["labels"] = tokenized_labels["input_ids"]
    return tokenized_inputs

# Applying preprocessing
dataset = dataset.map(preprocess_function, batched=True, remove_columns=df.columns.to_list())
dataset.set_format("torch")

# Training Arguments
training_args = TrainingArguments(
    output_dir="./fine_tuned_mistral_gd",
    per_device_train_batch_size=1,
    gradient_accumulation_steps=8,
    num_train_epochs=2,
    logging_steps=5,
    save_total_limit=2,
    fp16=True,
    bf16=False,
    remove_unused_columns=False,
    label_names=["labels"],
    report_to="none"
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset
)


trainer.train()

# Save Fine-Tuned Model
model.save_pretrained("./fine_tuned_mistral_gd")
tokenizer.save_pretrained("./fine_tuned_mistral_gd")

print("Fine-tuning complete! Model saved locally.")
