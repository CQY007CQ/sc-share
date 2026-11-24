"""Grid search algorithms used by SC Lab exercises."""

from __future__ import annotations

import heapq
import math
import random
from collections.abc import Iterable
from dataclasses import dataclass
from typing import Literal

Position = tuple[int, int]
Heuristic = Literal["manhattan", "euclidean", "octile"]


@dataclass(frozen=True)
class SearchResult:
    """Result and observable metrics from one A* run."""

    found: bool
    path: tuple[Position, ...]
    cost: float
    expanded: int
    generated: int


def heuristic(a: Position, b: Position, mode: Heuristic) -> float:
    dx, dy = abs(a[0] - b[0]), abs(a[1] - b[1])
    if mode == "manhattan":
        return float(dx + dy)
    if mode == "euclidean":
        return math.hypot(dx, dy)
    if mode == "octile":
        return max(dx, dy) + (math.sqrt(2) - 1) * min(dx, dy)
    raise ValueError(f"unsupported heuristic: {mode}")


def neighbor_steps(neighbors: int) -> tuple[Position, ...]:
    if neighbors == 4:
        return ((0, 1), (-1, 0), (1, 0), (0, -1))
    if neighbors == 8:
        return (
            (0, 1), (-1, 0), (1, 0), (0, -1),
            (-1, 1), (1, 1), (-1, -1), (1, -1),
        )
    raise ValueError("neighbors must be 4 or 8")


def generate_blocks(
    size: Position,
    count: int,
    start: Position,
    goal: Position,
    seed: int | None = None,
) -> set[Position]:
    candidates = [
        (x, y)
        for x in range(size[0])
        for y in range(size[1])
        if (x, y) not in {start, goal}
    ]
    if count < 0 or count > len(candidates):
        raise ValueError("block count is outside the available grid")
    return set(random.Random(seed).sample(candidates, count))


def astar(
    size: Position,
    start: Position,
    goal: Position,
    blocks: Iterable[Position] = (),
    *,
    neighbors: int = 4,
    heuristic_mode: Heuristic = "manhattan",
) -> SearchResult:
    """Find a lowest-cost path on a rectangular grid using A*."""
    width, height = size
    if width <= 0 or height <= 0:
        raise ValueError("grid dimensions must be positive")
    if not (0 <= start[0] < width and 0 <= start[1] < height):
        raise ValueError("start is outside the grid")
    if not (0 <= goal[0] < width and 0 <= goal[1] < height):
        raise ValueError("goal is outside the grid")

    blocked = set(blocks)
    if start in blocked or goal in blocked:
        return SearchResult(False, (), math.inf, 0, 0)

    frontier: list[tuple[float, float, int, Position]] = []
    heapq.heappush(frontier, (heuristic(start, goal, heuristic_mode), 0.0, 0, start))
    came_from: dict[Position, Position | None] = {start: None}
    g_score = {start: 0.0}
    closed: set[Position] = set()
    serial = 1
    generated = 1

    while frontier:
        _, _, _, current = heapq.heappop(frontier)
        if current in closed:
            continue
        closed.add(current)
        if current == goal:
            break

        for dx, dy in neighbor_steps(neighbors):
            nxt = current[0] + dx, current[1] + dy
            if not (0 <= nxt[0] < width and 0 <= nxt[1] < height):
                continue
            if nxt in blocked or nxt in closed:
                continue
            tentative = g_score[current] + math.hypot(dx, dy)
            if tentative >= g_score.get(nxt, math.inf):
                continue
            came_from[nxt] = current
            g_score[nxt] = tentative
            h = heuristic(nxt, goal, heuristic_mode)
            heapq.heappush(frontier, (tentative + h, h, serial, nxt))
            serial += 1
            generated += 1

    if goal not in came_from:
        return SearchResult(False, (), math.inf, len(closed), generated)

    path: list[Position] = []
    node: Position | None = goal
    while node is not None:
        path.append(node)
        node = came_from[node]
    path.reverse()
    return SearchResult(True, tuple(path), g_score[goal], len(closed), generated)

