/**
 * 动线顺路度评分（routeScore）与当天负荷（dayLoad）。
 *
 * 出处：小程序 utils/travel.js 的 routeScore / dayLoad。
 *
 * 关键设计：routeScore **只评分、不改序**。
 *   排序在生成阶段就定了；评分是给用户看的解释性数字（「2 个点 · 动线约 14 km · 很顺路」）。
 *   一旦让评分反过来改序，就会出现「用户手动挪了一下顺序，刷新后又被改回去」的体验崩坏。
 *   所以这个函数是纯函数：输入当天行程，输出分数、文案、色档，不写回任何状态。
 *
 * 评分口径（沿用线上参数，未做二次调参）：
 *   - 只统计「有真实坐标（approx === false）」的点。估算坐标连线会得出假里程，
 *     宁可不计分，也不给用户一个错的数字。
 *   - 主指标是**相邻点平均间距**，不是总里程 —— 总里程随点数增长，
 *     4 个点排得再顺也会比 2 个点「总里程大」，拿来横向比较没有意义。
 *   - 附加惩罚：出现一个「绝对距离 > 20 km 且 > 平均间距 2.2 倍」的长转场，
 *     说明中间插了一个跨片区点，扣 12 分并在文案里点名是哪个点拖累的。
 */

const { haversine } = require("./geo.js");

const SCORE_TIERS = [
  { maxAvg: 6, score: 95 },
  { maxAvg: 12, score: 89 },
  { maxAvg: 25, score: 81 },
  { maxAvg: 45, score: 71 },
  { maxAvg: Infinity, score: 58 },
];

function feelOf(score) {
  if (score >= 88) return "很顺路";
  if (score >= 76) return "较顺路";
  if (score >= 62) return "一般，有绕路";
  return "偏赶，建议挪点";
}

function scoreClsOf(score) {
  if (score >= 88) return "rb-good";
  if (score >= 62) return "rb-mid";
  return "rb-low";
}

/**
 * @param {Array} items 当天行程项 [{ name }]，顺序即真实动线顺序
 * @param {function} coordOf (name) => {lat, lon, approx} | null
 */
function routeScore(items, coordOf) {
  const pts = [];
  const seen = new Set();
  (Array.isArray(items) ? items : []).forEach((it) => {
    const n = it && it.name;
    if (!n || seen.has(n)) return;
    seen.add(n);
    const c = coordOf(n);
    if (c && c.lat && c.lon && c.approx === false) pts.push({ lat: c.lat, lon: c.lon, name: n });
  });
  if (pts.length < 2) return { ok: false, n: pts.length };

  let km = 0;
  let mx = 0;
  let mxIdx = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = haversine(pts[i - 1], pts[i]);
    km += d;
    if (d > mx) {
      mx = d;
      mxIdx = i;
    }
  }
  const avg = km / (pts.length - 1);
  let score;
  if (pts.length === 2) {
    score = avg <= 15 ? 93 : avg <= 40 ? 82 : 66;
  } else {
    score = SCORE_TIERS.find((t) => avg <= t.maxAvg).score;
  }
  let long = false;
  if (mx > 20 && mx > avg * 2.2) {
    long = true;
    score = Math.max(48, score - 12);
  }
  const txt =
    pts.length + " 个点 · 动线约 " + Math.round(km) + " km" + (long ? " · 有跨片区长转场（" + pts[mxIdx].name + "）" : "");
  return {
    ok: true,
    n: pts.length,
    km: Math.round(km),
    score,
    txt,
    feel: feelOf(score),
    long,
    scoreCls: scoreClsOf(score),
  };
}

/** 当天负荷：景点合计时长 vs 12 小时可用时长 */
function dayLoad(items) {
  const list = (Array.isArray(items) ? items : []).filter((it) => it && typeof it.hours === "number");
  const total = list.reduce((a, x) => a + x.hours, 0);
  const over = Math.max(0, total - 12);
  const round1 = (v) => Math.round(v * 10) / 10;
  return {
    n: list.length,
    hours: round1(total),
    over: round1(over),
    txt: "景点合计约 " + round1(total) + " 小时" + (over > 0 ? "，超出 12 小时可用时长 " + round1(over) + " 小时，建议减负" : "，节奏健康"),
  };
}

module.exports = { routeScore, dayLoad, feelOf, scoreClsOf };
