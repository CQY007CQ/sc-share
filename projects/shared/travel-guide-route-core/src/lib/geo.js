/**
 * 球面距离：与小程序端 utils/geo.js 的 haversine 逐行等价。
 *
 * 为什么不用直接算「经纬度差的平方和」：
 *   北京纬度 39.9°，经度 1° 约 85 km，纬度 1° 约 111 km，两者不可直接相加；
 *   而行程排序只关心「哪两个点更近」，所以统一用 haversine 的球面公里数，
 *   全程一套口径，排序与评分不会互相打架。
 *
 * 输出保留 1 位小数（向下取整到 0.1 km），与线上完全一致 ——
 * 端上展示的「动线约 N km」就是这份取整后的数字，多端同源才不会出现
 * 「手机上 12 km、网页上 11.6 km」这种对不上的账。
 */

function _num(...args) {
  for (const v of args) if (typeof v === "number" && isFinite(v)) return v;
  return NaN;
}

/** 支持 {lat, lon} 与 {latitude, longitude} 两种入参（端上两套对象混用） */
function haversine(a, b) {
  if (!a || !b) return 0;
  const lat1 = _num(a.lat, a.latitude);
  const lon1 = _num(a.lon, a.longitude);
  const lat2 = _num(b.lat, b.latitude);
  const lon2 = _num(b.lon, b.longitude);
  if (!(isFinite(lat1) && isFinite(lon1) && isFinite(lat2) && isFinite(lon2))) return 0;
  const R = Math.PI / 180;
  const dLat = (lat2 - lat1) * R;
  const dLon = (lon2 - lon1) * R;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * R) * Math.cos(lat2 * R) * Math.sin(dLon / 2) ** 2;
  return Math.round(12742 * Math.asin(Math.sqrt(h)) * 10) / 10;
}

module.exports = { haversine };
