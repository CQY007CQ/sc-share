"""Neo4j import helpers with validation and repeatable writes."""

from __future__ import annotations

import csv
import re
from collections import defaultdict
from pathlib import Path
from typing import Any


def normalize_relation_type(value: str) -> str:
    """Return a safe Neo4j relationship type."""
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", value):
        raise ValueError(f"invalid relationship type: {value!r}")
    return value.upper()


def load_rows(path: str | Path) -> list[dict[str, str]]:
    """Load and validate head/tail/relation/label records from CSV."""
    with Path(path).open(encoding="utf-8-sig", newline="") as stream:
        rows = list(csv.DictReader(stream))
    required = {"head", "tail", "relation", "label"}
    if not rows:
        raise ValueError("CSV contains no relationship records")
    if not required.issubset(rows[0]):
        raise ValueError(f"CSV must contain columns: {sorted(required)}")
    for row in rows:
        if not row["head"].strip() or not row["tail"].strip():
            raise ValueError("head and tail must not be empty")
        row["relation"] = normalize_relation_type(row["relation"])
    return rows


def import_honglou(
    csv_path: str | Path,
    *,
    uri: str,
    user: str,
    password: str,
) -> dict[str, int]:
    """Import a relationship CSV into Neo4j using grouped transactions."""
    try:
        from neo4j import GraphDatabase
    except ImportError as exc:
        raise RuntimeError("install the optional dependency: pip install -e .[neo4j]") from exc

    groups: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in load_rows(csv_path):
        groups[row["relation"]].append(
            {"head": row["head"].strip(), "tail": row["tail"].strip(), "label": row["label"].strip()}
        )

    with GraphDatabase.driver(uri, auth=(user, password)) as driver:
        driver.verify_connectivity()
        with driver.session(database="neo4j") as session:
            session.run(
                "CREATE CONSTRAINT honglou_name IF NOT EXISTS "
                "FOR (p:HongLouPerson) REQUIRE p.name IS UNIQUE"
            ).consume()
            for rel_type, rows in groups.items():
                session.run(
                    f"""
                    UNWIND $rows AS row
                    MERGE (a:HongLouPerson {{name: row.head}})
                    MERGE (b:HongLouPerson {{name: row.tail}})
                    MERGE (a)-[r:{rel_type}]->(b)
                    SET r.label = row.label, r.source = 'csv'
                    """,
                    rows=rows,
                ).consume()
            record: Any = session.run(
                """
                MATCH (p:HongLouPerson) WITH count(p) AS nodes
                MATCH (:HongLouPerson)-[r]->(:HongLouPerson)
                RETURN nodes, count(r) AS relationships,
                       count(DISTINCT type(r)) AS relationship_types
                """
            ).single()
            return dict(record)

