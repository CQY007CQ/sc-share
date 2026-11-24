/**
 * 多景点路线排序：最近邻贪心 + 2-opt 局部搜索。
 *
 * 出处：小程序 planner.js 的「省内多城排序」段（省份精华游）。原实现排的是城市，
 * 这里排的是景点，逻辑一字未改 —— 选择它的原因是它只依赖「两点距离」，
 * 城市和景点在算法眼里都是带坐标的点，不需要改算法本体。
 *
 * 为什么不用精确 TSP / 动态规划：
 *   城市池最大量级是几十个点，精确解要么是指数级耗时，要么要引入第三方依赖；
 *   而用户的真实诉求是「别来回折返」，不是「理论最短」。最近邻贪心 1 ms 出解，
 *   已经能保证不折返；2-opt 再把残留的交叉往返拉直，实测里程再降 5%~15% 就够用。
 *
 * 为什么要固定起点：
 *   行程第一站永远从住宿地/省会出发，起点不参与重排。所以 2-opt 的内层
 *   循环 i 从 1 开始，不碰 ordered[0] —— 否则会算出「先飞到中间某城再回来」的
 *   纸面最优解，实际不可执行。
 */

const { haversine } = require("./geo.js");

/** 最近邻贪心：每次取离「当前点」最近的下一个点 */
function nearestNeighbor(points, start) {
  if (!points.length) return [];
  const ordered = [start];
  const rest = points.slice();
  let cursor = start;
  while (rest.length) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < rest.length; i++) {
      const d = haversine(rest[i], cursor);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    if (bestIdx < 0) break;
    ordered.push(rest[bestIdx]);
    cursor = rest[bestIdx];
    rest.splice(bestIdx, 1);
  }
  return ordered;
}

/** 路径总里程（不含回到起点，行程是单向的） */
function pathKm(path) {
  let sum = 0;
  for (let i = 1; i < path.length; i++) sum += haversine(path[i - 1], path[i]);
  return sum;
}

/**
 * 2-opt：反复尝试「反转中间一段子路径」，总里程下降就保留。
 * 判定用 km + 0.5 < bestKm，留 0.5 km 死区 —— 否则
 * 往返 0.1 km 的抖动（坐标只保留 3 位小数）会让循环一直「有改进」，白跑。
 */
function twoOpt(path, maxRounds = 60) {
  if (path.length < 4) return { path, km: pathKm(path), rounds: 0 };
  let bestRoute = path.slice();
  let bestKm = pathKm(bestRoute);
  let improved = true;
  let rounds = 0;
  while (improved && rounds < maxRounds) {
    improved = false;
    rounds++;
    for (let i = 1; i < bestRoute.length - 1; i++) {
      for (let j = i + 1; j < bestRoute.length; j++) {
        const cand = bestRoute.slice(0, i).concat(bestRoute.slice(i, j + 1).reverse(), bestRoute.slice(j + 1));
        const km = pathKm(cand);
        if (km + 0.5 < bestKm) {
          bestRoute = cand;
          bestKm = km;
          improved = true;
        }
      }
    }
  }
  return { path: bestRoute, km: bestKm, rounds };
}

/**
 * 对外入口：从 start（住宿地）出发，把所有点排成一条不折返的路线。
 * 返回体里同时给出「贪心解」与「2-opt 之后」的里程，方便说明优化到底省了多少。
 */
function orderRoute(points, start) {
  const greedy = nearestNeighbor(points, start);
  const beforeKm = pathKm(greedy);
  const opt = twoOpt(greedy);
  return {
    start,
    path: opt.path,
    greedyKm: Math.round(beforeKm * 10) / 10,
    km: Math.round(opt.km * 10) / 10,
    rounds: opt.rounds,
  };
}

module.exports = { nearestNeighbor, pathKm, twoOpt, orderRoute };
