# main.py
import os
import re
import json
import logging
from typing import Optional, List, Union, Dict, Any
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from groq import Groq

# Import prompt generators
from prompts import (
    get_single_post_system_prompt,
    get_single_post_user_prompt,
    get_calendar_system_prompt,
    get_calendar_user_prompt,
    get_regenerate_system_prompt,
    get_regenerate_user_prompt,
    get_image_prompt_system_prompt,
    get_image_prompt_user_prompt,
)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Social Media Content Generator API",
    description="Backend API for generating and refining social media posts using Groq llama-3.3-70b-versatile.",
    version="1.0.0"
)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for local development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Validate API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_your_groq_api_key"):
    logger.warning("GROQ_API_KEY is not configured or is placeholder. AI generation calls will fail.")

# Initialize Groq client
# Safe initialization: if API key is missing, client will be instantiated and fail gracefully on execution.
try:
    groq_client = Groq(api_key=GROQ_API_KEY)
except Exception as e:
    logger.error(f"Failed to initialize Groq client: {e}")
    groq_client = None


# Define Request Models
class GenerateRequest(BaseModel):
    input_text: str = Field(..., min_length=3, description="Topic/keyword or product/brand description")
    input_type: str = Field(..., pattern="^(topic|brand_description)$", description="Type of input text")
    platform: str = Field(..., pattern="^(linkedin|twitter|instagram)$", description="Target social media platform")
    mode: str = Field(..., pattern="^(single|calendar)$", description="Generation mode: single post or multi-day calendar")
    days: Optional[int] = Field(default=7, ge=1, le=30, description="Number of days for content calendar")

class RegenerateRequest(BaseModel):
    original_post: str = Field(..., min_length=1, description="The original post content to refine")
    platform: str = Field(..., description="Target platform")
    refine_instructions: str = Field(..., min_length=1, description="Refinement feedback (e.g. 'make it shorter')")


# Helper: Extract hashtags from text
def extract_hashtags_regex(text: str) -> List[str]:
    """
    Extracts hashtags from a post text and returns them as clean words without the '#' prefix.
    """
    # Match strings starting with # followed by alphanumeric characters/underscores
    tags = re.findall(r"#\w+", text)
    return [tag.lstrip("#") for tag in tags]


# Helper: Clean post text from trailing/inline hashtags block if displaying separately
# Note: Since the frontend might want to display the full text, we return the post text as is.
# But we also return the list of hashtags separately for UI layout convenience.


# Helper: Defensive JSON parsing
def parse_json_defensively(content: str) -> List[Dict[str, Any]]:
    """
    Tries multiple methods to parse a JSON array from Groq LLM response.
    """
    content_clean = content.strip()
    
    # 1. Strip markdown fences if present
    if content_clean.startswith("```"):
        # Remove first line (e.g., ```json or ```)
        lines = content_clean.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content_clean = "\n".join(lines).strip()

    # 2. Try parsing directly
    try:
        data = json.loads(content_clean)
        if isinstance(data, list):
            return data
    except json.JSONDecodeError:
        pass

    # 3. Extract JSON array using regex
    # Matches everything between the first outer [ and the last outer ]
    match_array = re.search(r"\[\s*\{.*\}\s*\]", content_clean, re.DOTALL)
    if match_array:
        try:
            data = json.loads(match_array.group(0))
            if isinstance(data, list):
                return data
        except json.JSONDecodeError:
            pass

    # 4. Extract single JSON object using regex if LLM returned an object instead of array
    match_obj = re.search(r"\{\s*.*\}", content_clean, re.DOTALL)
    if match_obj:
        try:
            data = json.loads(match_obj.group(0))
            if isinstance(data, dict):
                return [data]
        except json.JSONDecodeError:
            pass

    # 5. Last resort: If we failed to parse JSON, parse line-by-line as raw posts
    logger.error(f"Failed to parse JSON defensively. Content was: {content}")
    raise ValueError("The model output could not be parsed as valid JSON. Please try again.")


# Endpoints
@app.get("/")
def read_root():
    return {"message": "Social Media Content Generator API is running successfully."}


@app.post("/generate")
def generate_content(payload: GenerateRequest):
    if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_your_groq_api_key"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API key is not configured. Please add it to your backend/.env file."
        )

    if not groq_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API client is not initialized."
        )

    try:
        if payload.mode == "single":
            system_prompt = get_single_post_system_prompt(payload.platform)
            user_prompt = get_single_post_user_prompt(payload.input_text, payload.input_type)
            
            logger.info(f"Generating single post for platform: {payload.platform}")
            
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=1024,
            )
            
            raw_text = completion.choices[0].message.content.strip()
            
            # Extract hashtags from the raw text
            hashtags = extract_hashtags_regex(raw_text)

            # --- Generate a short image prompt via a second lightweight Groq call ---
            image_prompt = ""
            try:
                img_completion = groq_client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=[
                        {"role": "system", "content": get_image_prompt_system_prompt()},
                        {"role": "user",   "content": get_image_prompt_user_prompt(
                            payload.input_text, payload.input_type, payload.platform
                        )},
                    ],
                    temperature=0.8,
                    max_tokens=60,
                )
                image_prompt = img_completion.choices[0].message.content.strip()
            except Exception as img_err:
                logger.warning(f"Image prompt generation failed (non-fatal): {img_err}")
            
            return {
                "post_text": raw_text,
                "hashtags": hashtags,
                "image_prompt": image_prompt,
            }
            
        else:  # calendar mode
            days = payload.days or 7
            system_prompt = get_calendar_system_prompt(payload.platform, days)
            user_prompt = get_calendar_user_prompt(payload.input_text, payload.input_type, days)
            
            logger.info(f"Generating {days}-day content calendar for platform: {payload.platform}")
            
            completion = groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=3072,  # Give enough room for multi-day calendar JSON response
            )
            
            raw_response = completion.choices[0].message.content.strip()
            
            try:
                calendar_data = parse_json_defensively(raw_response)
                return calendar_data
            except ValueError as val_err:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=str(val_err)
                )
                
    except Exception as e:
        logger.error(f"Error calling Groq API: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating content: {str(e)}"
        )


@app.post("/regenerate")
def regenerate_content(payload: RegenerateRequest):
    if not GROQ_API_KEY or GROQ_API_KEY.startswith("gsk_your_groq_api_key"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API key is not configured. Please add it to your backend/.env file."
        )

    if not groq_client:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Groq API client is not initialized."
        )

    try:
        system_prompt = get_regenerate_system_prompt(payload.platform)
        user_prompt = get_regenerate_user_prompt(payload.original_post, payload.refine_instructions)
        
        logger.info(f"Refining post for platform: {payload.platform}")
        
        completion = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        
        raw_text = completion.choices[0].message.content.strip()
        hashtags = extract_hashtags_regex(raw_text)
        
        return {
            "post_text": raw_text,
            "hashtags": hashtags
        }
        
    except Exception as e:
        logger.error(f"Error calling Groq API for regeneration: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while regenerating content: {str(e)}"
        )
