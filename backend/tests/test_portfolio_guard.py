import pytest

from app.portfolio_guard import is_portfolio_question


@pytest.mark.parametrize(
    "question",
    [
        "How does Dor connect related news stories?",
        "Tell me about DOR's news globe.",
        "Could Transformer Lab help explain my homework?",
        "How does TRANSFORMER handle a homework example?",
    ],
)
def test_named_projects_are_allowed_even_with_unrelated_topic_words(question):
    assert is_portfolio_question(question) is True


@pytest.mark.parametrize(
    "question",
    [
        "What is the latest news?",
        "Write my homework essay.",
        "Tell me adorable news.",
        "Give me transformerish medical advice.",
    ],
)
def test_unrelated_questions_and_partial_project_name_matches_stay_blocked(question):
    assert is_portfolio_question(question) is False


def test_ambiguous_portfolio_follow_up_stays_allowed():
    assert is_portfolio_question("Tell me more.") is True
