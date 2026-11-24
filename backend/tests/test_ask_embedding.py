from unittest.mock import AsyncMock, Mock

import httpx
import pytest
from fastapi import HTTPException
from openai import APIConnectionError, OpenAIError

from app.config import Settings
from app.services import ask


@pytest.fixture
def settings():
    # Embedding dependencies are mocked; no credentials, database or network are needed.
    return Mock(spec=Settings)


def provider_error(error_type):
    if error_type is APIConnectionError:
        return APIConnectionError(
            message="synthetic-private-upstream-detail",
            request=httpx.Request("POST", "https://example.invalid/embeddings"),
        )
    return error_type("synthetic-private-upstream-detail")


@pytest.mark.parametrize("error_type", [RuntimeError, OpenAIError, APIConnectionError])
@pytest.mark.parametrize("failure_stage", ["client", "embedding"])
async def test_embedding_failures_return_safe_503_and_log_server_side(
    monkeypatch, settings, error_type, failure_stage
):
    error = provider_error(error_type)
    client = Mock()
    get_client = Mock(return_value=client)
    create_embedding = AsyncMock(return_value=[0.25, 0.75])
    log_exception = Mock()
    if failure_stage == "client":
        get_client.side_effect = error
    else:
        create_embedding.side_effect = error
    monkeypatch.setattr(ask, "get_openai_client", get_client)
    monkeypatch.setattr(ask, "create_embedding", create_embedding)
    monkeypatch.setattr(ask.logger, "exception", log_exception)

    with pytest.raises(HTTPException) as raised:
        await ask.embed_question("What is Dor?", settings)

    response_error = raised.value
    assert response_error.status_code == 503
    assert response_error.detail == (
        "Ask Ankit is temporarily unavailable. Please retry in a moment."
    )
    assert "synthetic-private-upstream-detail" not in response_error.detail
    assert response_error.__cause__ is error
    log_exception.assert_called_once_with("Question embedding unavailable")
    get_client.assert_called_once_with(settings)
    if failure_stage == "client":
        create_embedding.assert_not_awaited()
    else:
        create_embedding.assert_awaited_once_with(client, settings, "What is Dor?")


async def test_successful_embedding_passes_through_unchanged(monkeypatch, settings):
    client = Mock()
    embedding = [0.25, 0.75]
    get_client = Mock(return_value=client)
    create_embedding = AsyncMock(return_value=embedding)
    log_exception = Mock()
    monkeypatch.setattr(ask, "get_openai_client", get_client)
    monkeypatch.setattr(ask, "create_embedding", create_embedding)
    monkeypatch.setattr(ask.logger, "exception", log_exception)

    result = await ask.embed_question("What is Transformer Lab?", settings)

    assert result is embedding
    get_client.assert_called_once_with(settings)
    create_embedding.assert_awaited_once_with(client, settings, "What is Transformer Lab?")
    log_exception.assert_not_called()
