# prompts.py
"""
Platform-specific tone prompts and helper functions for generating social media posts.
Provides prompts for single post generation and content calendar generation.
"""

def get_platform_rules(platform: str) -> str:
    """
    Returns platform-specific rules for tone, structure, and character count.
    """
    platform = platform.lower()
    
    if platform == "linkedin":
        return (
            "Platform: LinkedIn\n"
            "Tone: Professional, thought-leadership, educational, and authoritative yet engaging.\n"
            "Format:\n"
            "- Write 3-5 short, easily digestible paragraphs.\n"
            "- Use spacing/line-breaks for readability.\n"
            "- Keep a hook in the first sentence.\n"
            "- Place 3-5 relevant professional hashtags at the very end.\n"
            "- Tone must feel expert, insightful, and valuable for professional networks."
        )
    elif platform == "twitter" or platform == "twitter/x" or platform == "x":
        return (
            "Platform: Twitter/X\n"
            "Tone: Punchy, conversational, bold, and highly concise.\n"
            "Format:\n"
            "- Strict maximum length of 280 characters (including text, spacing, and hashtags).\n"
            "- Include a strong hook line.\n"
            "- Use at most 1-2 relevant hashtags.\n"
            "- Keep sentences short and clear. Make it highly shareable or engaging."
        )
    elif platform == "instagram":
        return (
            "Platform: Instagram\n"
            "Tone: Casual, friendly, emoji-friendly, and highly interactive (encouraging saves/shares/comments).\n"
            "Format:\n"
            "- Start with an eye-catching hook sentence.\n"
            "- Use emojis throughout to break up text and add visual interest.\n"
            "- Write an engaging caption body.\n"
            "- Include a Call to Action (CTA) like 'Save this for later' or 'Comment below your thoughts!'.\n"
            "- Place a clean hashtag block (5-10 relevant hashtags) at the very end, separated by some spacing."
        )
    else:
        # Fallback default rules
        return (
            f"Platform: {platform.capitalize()}\n"
            "Tone: Engaging, friendly, and appropriate for general social media.\n"
            "Format:\n"
            "- Clear structure with a hook.\n"
            "- Include 2-4 relevant hashtags."
        )


def get_single_post_system_prompt(platform: str) -> str:
    """
    Constructs the system prompt for single post generation.
    """
    rules = get_platform_rules(platform)
    
    return (
        "You are an expert social media manager and content creator.\n"
        "Your task is to generate a single high-converting post based on the user's input.\n\n"
        "Here are the rules you MUST follow for the post:\n"
        f"{rules}\n\n"
        "Important Constraints:\n"
        "- Do NOT write any introduction or explanation (such as 'Here is your post:').\n"
        "- Output ONLY the final post content ready to be copy-pasted.\n"
        "- Follow the platform formatting instructions strictly."
    )


def get_single_post_user_prompt(input_text: str, input_type: str) -> str:
    """
    Constructs the user prompt for single post generation.
    """
    input_label = "Topic/Keyword" if input_type == "topic" else "Brand/Product Description"
    return f"Generate a post based on the following details:\n{input_label}: {input_text}"


def get_calendar_system_prompt(platform: str, days: int) -> str:
    """
    Constructs the system prompt for content calendar generation.
    """
    rules = get_platform_rules(platform)
    
    return (
        "You are an expert social media strategist.\n"
        f"Your task is to create a {days}-day content calendar for the specified platform.\n\n"
        "Here are the platform rules you MUST follow for EVERY single post in the calendar:\n"
        f"{rules}\n\n"
        "Output Format Constraint:\n"
        "You MUST return the output as a STRICT JSON array of objects. Do NOT output any explanation, "
        "no markdown fences, and no preamble text before or after the JSON. "
        "The output must be pure valid JSON that can be parsed directly.\n\n"
        "JSON Schema:\n"
        "[\n"
        "  {\n"
        "    \"day\": 1,\n"
        "    \"post_text\": \"The complete post content, formatted with appropriate spacing and emojis (if applicable) for the platform. For Twitter, keep it strictly under 280 characters.\",\n"
        "    \"hashtags\": [\"hashtag1\", \"hashtag2\"],\n"
        "    \"image_prompt\": \"A short (under 20 words), vivid, safe-for-work visual description of a social media graphic that would accompany this post.\"\n"
        "  },\n"
        "  ...\n"
        "]\n\n"
        "Double-check that the JSON format is perfect, matches the schema, uses correct escaping for double quotes inside strings, "
        "and adheres to the platform constraints for every item."
    )


def get_calendar_user_prompt(input_text: str, input_type: str, days: int) -> str:
    """
    Constructs the user prompt for content calendar generation.
    """
    input_label = "Topic/Keyword" if input_type == "topic" else "Brand/Product Description"
    return (
        f"Generate a {days}-day content calendar based on the following input:\n"
        f"{input_label}: {input_text}\n\n"
        f"Make sure to plan a structured, diverse {days}-day content journey (e.g., day 1 could be educational, day 2 a tips post, day 3 a call-to-action, etc.)."
    )


def get_regenerate_system_prompt(platform: str) -> str:
    """
    Constructs the system prompt for refining/regenerating an existing post.
    """
    rules = get_platform_rules(platform)
    
    return (
        "You are an expert social media copywriter.\n"
        "Your task is to rewrite and refine an existing post according to the user's instructions.\n\n"
        "You MUST keep the tone and formatting consistent with the platform rules unless instructed otherwise:\n"
        f"{rules}\n\n"
        "Important Constraints:\n"
        "- Do NOT write any introduction or explanation (such as 'Here is your revised post:').\n"
        "- Output ONLY the final revised post content (including hashtags if appropriate) ready to be copy-pasted."
    )


def get_regenerate_user_prompt(original_post: str, refine_instructions: str) -> str:
    """
    Constructs the user prompt for post regeneration.
    """
    return (
        f"Original Post:\n{original_post}\n\n"
        f"Refinement Instructions:\n{refine_instructions}\n\n"
        "Please rewrite the original post applying these instructions."
    )

def get_image_prompt_system_prompt() -> str:
    """
    System prompt instructing the model to produce a short visual image prompt
    suitable for an AI image generator (Pollinations.ai).
    """
    return (
        "You are a creative art director specialising in social media visuals.\n"
        "Given a topic or brand description and a target platform, output ONLY a single short image prompt "
        "(under 20 words) that describes a compelling, safe-for-work social media graphic.\n"
        "Rules:\n"
        "- Be specific and visual (colours, mood, subjects, style).\n"
        "- Do NOT include any explanation, quotes, or extra text — just the prompt itself.\n"
        "- Keep it safe for work and brand-appropriate."
    )


def get_image_prompt_user_prompt(input_text: str, input_type: str, platform: str) -> str:
    """
    User prompt for image prompt generation.
    """
    input_label = "Topic/Keyword" if input_type == "topic" else "Brand/Product Description"
    return (
        f"{input_label}: {input_text}\n"
        f"Platform: {platform}\n"
        "Generate the image prompt now."
    )
