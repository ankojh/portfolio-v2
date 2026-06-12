from typing import Any

from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    client_metadata: dict[str, Any] = Field(default_factory=dict)


class SourceChunk(BaseModel):
    source_path: str
    title: str
    similarity: float
    content: str


class AskResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


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
