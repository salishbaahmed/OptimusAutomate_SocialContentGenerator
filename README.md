# Social Media Content Generator

An AI-powered full-stack web app that generates platform-adapted social media posts — and matching AI-generated images — from a simple topic or brand description. Powered by **Groq** (`llama-3.3-70b-versatile`) for text and **Pollinations.ai** for images (no image API key required).

> Built for the **OptimusAutomate AI Automation Internship — Social Media Content Generator**

<!-- Add screenshot here -->

---

## Features

- **Platform-adapted post generation** — LinkedIn (thought-leadership tone), Twitter/X (≤280 characters, punchy), Instagram (emoji-rich, casual, with CTA)
- **Single post mode** — generate one ready-to-publish post instantly
- **Content calendar mode** — generate a structured multi-day posting plan (1–30 days) from a brand/product description
- **AI-generated images** — every post gets a matching graphic via Pollinations.ai
- **Refine / regenerate text** — give plain-English instructions to rework any post (e.g. "make it funnier", "more formal", "shorter")
- **Regenerate image** — re-roll the image for a fresh visual with one click
- **Copy to clipboard** — one-click copy of the full post text including hashtags

---

## Prerequisites

| Requirement | Version |
|---|---|
| Python | 3.10 or higher |
| Node.js | 18 or higher |
| Groq API key | Free — get one at [console.groq.com](https://console.groq.com) |

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/OptimusAutomate_SocialContentGenerator.git
cd OptimusAutomate_SocialContentGenerator
```

### 2. Backend (FastAPI)

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env        # Windows
# cp .env.example .env        # macOS / Linux
```

Open `.env` and paste your Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_key_here
```

Start the API server:

```bash
uvicorn main:app --port 8000
```

The backend runs at `http://localhost:8000`. You can view interactive API docs at `http://localhost:8000/docs`.

### 3. Frontend (React + Vite)

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

---

## How to Use the App

**Step 1 — Choose your input type**
Toggle between:
- **Topic / Keyword** — e.g. "The future of remote work"
- **Brand Description** — e.g. "OptimusAutomate is an AI-powered workflow builder that saves teams 10+ hours a week"

**Step 2 — Write your input**
Type your topic or brand description in the text area.

**Step 3 — Select a platform**

| Platform | Tone style |
|---|---|
| 💼 LinkedIn | Professional, thought-leadership, 3–5 paragraphs, 3–5 hashtags |
| 🐦 Twitter / X | Punchy, concise, max 280 characters, 1–2 hashtags |
| 📷 Instagram | Casual, emoji-rich, engaging CTA, 5–10 hashtag block |

**Step 4 — Choose a mode**
- **Single Post** — generates one post for your chosen platform
- **📅 Calendar** — generates a multi-day content plan (set duration, 1–30 days)

**Step 5 — Generate**
Click **✨ Generate Content**. Once complete, post card(s) appear with:
- An AI-generated image at the top
- Platform badge and day label (calendar mode)
- Full post text formatted for the platform
- Hashtags as pills

<!-- Add screenshot here -->

**Step 6 — Refine the post text (optional)**
Click **🔄 Refine Post**, type an instruction (e.g. "make it shorter", "add more humour"), and press **➤**. The post rewrites in place.

**Step 7 — Regenerate the image (optional)**
Click **🔄 New Image** in the bottom-right of the image to get a different visual for the same prompt.

<!-- Add screenshot here -->

**Step 8 — Copy your post**
Click **📋** to copy the full post text (including hashtags). It turns **✅** to confirm.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | [FastAPI](https://fastapi.tiangolo.com/) + [Uvicorn](https://www.uvicorn.org/) |
| AI text generation | [Groq API](https://groq.com/) — `llama-3.3-70b-versatile` |
| AI image generation | [Pollinations.ai](https://pollinations.ai/) — free, no API key |
| Frontend framework | [React](https://react.dev/) + [Vite](https://vitejs.dev/) |
| Styling | Vanilla CSS with glassmorphism design |
| Environment config | [python-dotenv](https://pypi.org/project/python-dotenv/) |

---

## Project Structure

```
OptimusAutomate_SocialContentGenerator/
│
├── backend/
│   ├── main.py              # FastAPI app — /generate and /regenerate endpoints
│   ├── prompts.py           # Platform tone rules + image prompt helpers
│   ├── requirements.txt     # Python dependencies
│   ├── .env.example         # Environment variable template
│   └── .env                 # Local secrets (git-ignored)
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root component — state management & layout
│   │   ├── api.js               # Fetch wrappers for backend endpoints
│   │   ├── index.css            # Global styles & design system
│   │   └── components/
│   │       ├── InputForm.jsx    # Left panel — all user inputs
│   │       ├── PostCard.jsx     # Single post card with image & refine drawer
│   │       └── CalendarView.jsx # Calendar grid — renders PostCard per day
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/generate` | Generate a single post or content calendar |
| `POST` | `/regenerate` | Refine an existing post with new instructions |

---

## Notes & Limitations

- The Groq free tier has rate limits — if you hit a 429 error, wait a moment and retry.
- Pollinations.ai images can take 5–15 seconds to generate and may occasionally fail — use **🔄 New Image** to retry.
- Twitter/X posts are prompted to stay under 280 characters; the model generally respects this but may occasionally exceed it slightly.

---

## Built For

This project was developed as **Task 2: Social Media Content Generator** for the **OptimusAutomate AI Automation Internship Programme**.
