from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=4000)


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    history: list[ChatTurn] = Field(default_factory=list, max_length=12)
    client_metadata: dict[str, Any] = Field(default_factory=dict)


class TopQuestionResponse(BaseModel):
    question: str
    asked_count: int


class TopQuestionsResponse(BaseModel):
    questions: list[TopQuestionResponse]


class IngestResponse(BaseModel):
    files_indexed: int
    chunks_indexed: int
    chunks_embedded: int = 0
    chunks_deleted: int = 0
