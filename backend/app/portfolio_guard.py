from __future__ import annotations

import re


PORTFOLIO_TERMS = {
    "ai",
    "ankit",
    "backend",
    "background",
    "bio",
    "career",
    "contact",
    "cv",
    "deployment",
    "education",
    "email",
    "experience",
    "fastapi",
    "frontend",
    "github",
    "hire",
    "hiring",
    "linkedin",
    "ojha",
    "openai",
    "pgvector",
    "portfolio",
    "postgres",
    "project",
    "projects",
    "rag",
    "react",
    "render",
    "resume",
    "roadmap",
    "skill",
    "skills",
    "stack",
    "vercel",
    "work",
}

PORTFOLIO_PHRASES = (
    "about you",
    "about yourself",
    "what are you building",
    "what did you build",
    "what do you build",
    "what do you do",
    "what have you built",
    "what is your background",
    "what is your experience",
    "what is your stack",
    "what kind of work",
    "who are you",
    "who is ankit",
    "your background",
    "your experience",
    "your portfolio",
    "your projects",
    "your skills",
    "your work",
)

UNRELATED_TERMS = {
    "bitcoin",
    "crypto",
    "doctor",
    "essay",
    "flight",
    "homework",
    "hotel",
    "joke",
    "lawyer",
    "lyrics",
    "medical",
    "movie",
    "news",
    "poem",
    "president",
    "recipe",
    "restaurant",
    "song",
    "sports",
    "stock",
    "tax",
    "translate",
    "travel",
    "weather",
}


def is_portfolio_question(question: str) -> bool:
    normalized = question.lower().strip()
    words = set(re.findall(r"[a-z0-9]+", normalized))

    if words.intersection(PORTFOLIO_TERMS):
        return True

    if any(phrase in normalized for phrase in PORTFOLIO_PHRASES):
        return True

    if words.intersection(UNRELATED_TERMS):
        return False

    return False
