"""Command-line interface for SC Lab exercises."""

from __future__ import annotations

import argparse
import json
import os

from .knowledge_graph import import_honglou
from .search import astar, generate_blocks


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="sc-lab")
    sub = parser.add_subparsers(dest="command", required=True)

    astar_parser = sub.add_parser("astar", help="run an A* grid experiment")
    astar_parser.add_argument("--width", type=int, default=20)
    astar_parser.add_argument("--height", type=int, default=20)
    astar_parser.add_argument("--blocks", type=int, default=50)
    astar_parser.add_argument("--neighbors", type=int, choices=(4, 8), default=4)
    astar_parser.add_argument("--heuristic", choices=("manhattan", "euclidean", "octile"), default="manhattan")
    astar_parser.add_argument("--seed", type=int, default=20261122)

    graph_parser = sub.add_parser("knowledge-graph", help="import a Honglou relationship CSV")
    graph_parser.add_argument("--csv", required=True)
    graph_parser.add_argument("--uri", default=os.getenv("NEO4J_URI", "bolt://localhost:7687"))
    graph_parser.add_argument("--user", default=os.getenv("NEO4J_USER", "neo4j"))
    return parser


def main() -> None:
    args = build_parser().parse_args()
    if args.command == "astar":
        size = (args.width, args.height)
        start, goal = (0, 0), (args.width - 1, args.height - 1)
        blocks = generate_blocks(size, args.blocks, start, goal, args.seed)
        result = astar(size, start, goal, blocks, neighbors=args.neighbors, heuristic_mode=args.heuristic)
        print(json.dumps(result.__dict__, ensure_ascii=False, indent=2))
        return

    password = os.getenv("NEO4J_PASSWORD")
    if not password:
        raise SystemExit("set NEO4J_PASSWORD before importing data")
    result = import_honglou(args.csv, uri=args.uri, user=args.user, password=password)
    print(json.dumps(result, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()

