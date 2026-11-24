import math

import pytest

from sc_lab.search import astar, generate_blocks, heuristic


def test_manhattan_distance():
    assert heuristic((0, 0), (3, 4), "manhattan") == 7


def test_four_neighbor_open_grid():
    result = astar((5, 5), (0, 0), (4, 4))
    assert result.found
    assert result.cost == 8
    assert len(result.path) == 9


def test_eight_neighbor_open_grid():
    result = astar((5, 5), (0, 0), (4, 4), neighbors=8, heuristic_mode="octile")
    assert result.found
    assert result.cost == pytest.approx(4 * math.sqrt(2))


def test_unreachable_goal():
    blocks = {(3, 4), (4, 3), (3, 3)}
    result = astar((5, 5), (0, 0), (4, 4), blocks)
    assert not result.found
    assert result.path == ()


def test_blocks_never_cover_endpoints():
    blocks = generate_blocks((10, 10), 20, (0, 0), (9, 9), seed=7)
    assert (0, 0) not in blocks
    assert (9, 9) not in blocks
    assert len(blocks) == 20

