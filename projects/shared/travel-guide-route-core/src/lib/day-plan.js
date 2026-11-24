/**
 * 分日排程：带权游标最近邻。
 *
 * 出处：小程序 planner.js 的 `nearest()`（生成每日行程时逐格取点）。
 * 它要解决的问题比「排序」更棘手：
 *   用户要的不是一条最短路径，而是「每天都不折腾」+「远郊景点别混在市区日里」。
 *   纯最近邻会算出「上午故宫、下午长城、晚上南锣鼓巷」—— 总里程好看，人累死。
 *
 * 三层改造（全部在打分里，不额外写分支判断）：
 *   1. 市区优先：距城心 ≤ 25 km 视为市区。市区点与远郊点分两个候选池各取最优，
 *      只有「游标已经在远郊」或「市区候选快用完（≤1）而远郊还有 ≥2 个」时，
 *      才允许当天从远郊起手 —— 于是长城、十三陵这种自然聚成同一天的「一日游」。
 *   2. 偏好加成：出行模式 / 攻略风格 / 体力画像 / 想玩清单都折算成公里数加减，
 *      参与同一个比较。好处是「权重」和「距离」量纲一致，不用调参调出一堆阈值。
 *      想玩清单 −400 是刻意给的大权重：用户主动收藏的景点，绕 400 km 也该排进去。
 *   3. 游标（cursor）每天重置回住宿地：真实行程每天从酒店出门，不是接着昨天最后一站。
 *
 * 权重常量见下方 WEIGHTS，全部可被调用方覆盖 —— 线上是画像驱动，这里给默认值。
 */

const { haversine } = require("./geo.js");

const WEIGHTS = {
  urbanRadiusKm: 25, // 距城心超过这个距离算「远郊」
  effortPenalty: 260, // 体力画像=怕累(walk:0) 时，费力景点(level 2)的加价
  wishedBoost: -400, // 想玩清单里的景点优先（负值=更容易被选中）
  noCoordPenalty: 9999, // 没有真实坐标的点最后兜底，绝不能靠「猜的距离」排在前面
};

/**
 * @param {object}   opts
 * @param {Array}    opts.spots    候选景点（含 name/period/lat/lon/effort）
 * @param {object}   opts.anchor   城心坐标 {lat, lon}
 * @param {object}   opts.hotel    住宿地坐标，作为每天的出发游标
 * @param {number}   opts.days     天数
 * @param {string[]} opts.periods  每天要填的时段，如 ["上午","下午","傍晚"]
 * @param {object}   [opts.profile] 出行画像 { walk: 0|1 }  walk=0 表示怕累
 * @param {string[]} [opts.wished]  想玩清单
 * @param {function} [opts.modeEff]  出行模式偏好，返回 km 加成
 * @param {function} [opts.biasEff]  攻略风格偏好，返回 km 加成
 */
function planDays(opts) {
  const spots = (opts.spots || []).map((s) => ({ ...s }));
  const anchor = opts.anchor || null;
  const hotel = opts.hotel || anchor;
  const days = Math.max(1, opts.days || 1);
  const periods = opts.periods && opts.periods.length ? opts.periods : ["上午", "下午", "傍晚"];
  const profile = opts.profile || null;
  const wished = new Set(opts.wished || []);
  const modeEff = typeof opts.modeEff === "function" ? opts.modeEff : () => 0;
  const biasEff = typeof opts.biasEff === "function" ? opts.biasEff : () => 0;

  const isFar = (s) => (anchor ? haversine(s, anchor) > WEIGHTS.urbanRadiusKm : false);
  // 一个景点可能有多个可接受时段（故宫上午/下午都行）。线上数据里 period 是单值，
  // 但取点函数的入参本来就是「想要的时段数组」，这里把「景点也可多选」补齐，
  // 否则「只在上午开放」的点一旦超过天数就会被成批丢弃 —— 那是排程器的锅，不是用户的锅。
  const periodsOf = (s) => (Array.isArray(s.periods) && s.periods.length ? s.periods : [s.period]);
  const fits = (s, wanted) => periodsOf(s).some((p) => wanted.includes(p));
  let urbanLeft = spots.filter((s) => !isFar(s)).length;
  let farLeft = spots.length - urbanLeft;

  const takeOne = (wanted, cursor) => {
    let bestIdx = -1;
    let bestDist = Infinity;
    let farIdx = -1;
    let farDist = Infinity;
    for (let i = 0; i < spots.length; i++) {
      const s = spots[i];
      if (!fits(s, wanted)) continue;
      let d = s.lat != null && s.lon != null && cursor ? haversine(s, cursor) : WEIGHTS.noCoordPenalty;
      d += modeEff(s.name) + biasEff(s.name);
      if (profile && profile.walk === 0 && s.effort >= 2) d += WEIGHTS.effortPenalty;
      if (wished.has(s.name)) d += WEIGHTS.wishedBoost;
      if (isFar(s)) {
        if (d < farDist) {
          farDist = d;
          farIdx = i;
        }
      } else if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const cursorFar = cursor && anchor ? haversine(cursor, anchor) > WEIGHTS.urbanRadiusKm : false;
    const startFar = urbanLeft <= 1 && farLeft >= 2;
    const idx = cursorFar || startFar ? (farIdx >= 0 ? farIdx : bestIdx) : bestIdx >= 0 ? bestIdx : farIdx;
    if (idx < 0) return null;
    const s = spots.splice(idx, 1)[0];
    if (isFar(s)) farLeft--;
    else urbanLeft--;
    return s;
  };

  const out = [];
  for (let d = 0; d < days; d++) {
    let cursor = hotel ? { lat: hotel.lat, lon: hotel.lon } : null;
    const items = [];
    for (const p of periods) {
      // 先按当前时段取；取不到再放开到「全天」景点兜底。
      // 线上原实现如此：否则故宫闭馆日/淡季这类「该时段无候选」会直接留空格。
      const s = takeOne([p], cursor) || takeOne(["全天"], cursor);
      if (!s) continue;
      const from = cursor;
      const legKm = from ? haversine(s, from) : 0;
      if (s.lat != null && s.lon != null) cursor = { lat: s.lat, lon: s.lon };
      items.push({ name: s.name, period: p, effort: s.effort, hours: s.hours, legKm, far: isFar(s) });
    }
    out.push({ day: d + 1, items });
  }
  return out;
}

module.exports = { planDays, WEIGHTS };
