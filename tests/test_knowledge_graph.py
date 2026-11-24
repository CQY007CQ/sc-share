from pathlib import Path

import pytest

from sc_lab.knowledge_graph import load_rows, normalize_relation_type


def test_normalize_relation_type():
    assert normalize_relation_type("servant_girl") == "SERVANT_GIRL"


def test_reject_unsafe_relation_type():
    with pytest.raises(ValueError):
        normalize_relation_type("wife; MATCH (n)")


def test_load_sample_csv():
    path = Path(__file__).parents[1] / "data" / "honglou_sample.csv"
    rows = load_rows(path)
    assert len(rows) >= 5
    assert rows[0]["relation"] == "SON"

