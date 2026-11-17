// Desenha um nível inteiro num canvas grande e devolve os recortes (tiles) em PNG base64.
window.renderLevel = function (STR, opt) {
  const { K, BB, TILE, theme, labels, smallMinK } = opt
  const M = 111320, LATC = (BB[0] + BB[2]) / 2, MX = M * Math.cos(LATC * Math.PI / 180)
  const W = Math.ceil((BB[3] - BB[1]) * MX * K / 1000 / TILE) * TILE, H = Math.ceil((BB[2] - BB[0]) * M * K / 1000 / TILE) * TILE
  const P = (la, lo) => [(lo - BB[1]) * MX * K / 1000, (BB[2] - la) * M * K / 1000]
  const T = theme === 'dark'
    ? { bg: '#141A21', small: '#232C35', mid: '#33404D', big: '#3F4E5D', park: '#1B2B24', rail: '#5A3A33', water: '#1A2E3D', label: '#8E9AA3', halo: '#141A21' }
    : { bg: '#F1F3F4', small: '#FFFFFF', mid: '#E6E9EC', big: '#D3D9E2', park: '#DCEBD5', rail: '#E8B8A0', water: '#C8E1F0', label: '#5F6B76', halo: '#F1F3F4' }
  const dec = (str) => { const pts = []; let i = 0, la = 0, lo = 0; const nx = () => { let r = 0, s = 0, b; do { b = str.charCodeAt(i++) - 63; r |= (b & 31) << s; s += 5 } while (b >= 32); return r & 1 ? ~(r >> 1) : r >> 1 }; while (i < str.length) { la += nx(); lo += nx(); pts.push([la / 1e5, lo / 1e5]) } return pts }
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d')
  g.fillStyle = T.bg; g.fillRect(0, 0, W, H); g.lineCap = 'round'; g.lineJoin = 'round'
  const path = (p) => { g.beginPath(); p.forEach((q, i) => { const [x, y] = P(q[0], q[1]); i ? g.lineTo(x, y) : g.moveTo(x, y) }) }
  const sc = Math.max(0.5, Math.min(1.3, K / 128))
  for (const e of STR.park) { path(dec(e)); g.fillStyle = T.park; g.fill() }
  const roads = {}; for (const k of ['small', 'mid', 'big']) roads[k] = STR[k].map(e => ({ p: dec(e[0]), nm: e[1] >= 0 ? STR.names[e[1]] : '' }))
  const Wd = { small: 2.2 * sc, mid: 4 * sc, big: 6 * sc }
  for (const k of ['small', 'mid', 'big']) { if (k === 'small' && K < smallMinK) continue; for (const r of roads[k]) { path(r.p); g.strokeStyle = T[k]; g.lineWidth = Wd[k]; g.stroke() } }
  for (const e of STR.rail) { path(dec(e)); g.strokeStyle = T.rail; g.lineWidth = 2.2; g.stroke() }
  if (labels) {
    const abbr = s => s.replace(/^Avenida /i, 'Av. ').replace(/^Rua /i, 'R. ').replace(/^Rodovia /i, 'Rod. ').replace(/^Praça /i, 'Pç. ').replace(/^Alameda /i, 'Al. ').replace(/^Viaduto /i, 'Vd. ').replace(/ Presidente /, ' Pres. ')
    g.font = `600 ${labels.size}px Inter, Arial, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'
    const placed = []; const grid = new Map(); const cell = 120
    const hit = (b) => { for (let cx = Math.floor(b.x0 / cell); cx <= Math.floor(b.x1 / cell); cx++) for (let cy = Math.floor(b.y0 / cell); cy <= Math.floor(b.y1 / cell); cy++) { const a = grid.get(cx + ',' + cy); if (a) for (const p of a) if (!(b.x1 < p.x0 || b.x0 > p.x1 || b.y1 < p.y0 || b.y0 > p.y1)) return true } return false }
    const add = (b) => { for (let cx = Math.floor(b.x0 / cell); cx <= Math.floor(b.x1 / cell); cx++) for (let cy = Math.floor(b.y0 / cell); cy <= Math.floor(b.y1 / cell); cy++) { const k = cx + ',' + cy; (grid.get(k) || grid.set(k, []).get(k)).push(b) } }
    const kinds = labels.kinds
    const cands = []
    for (const k of kinds) for (const r of roads[k]) if (r.nm) { const pts = r.p.map(q => P(q[0], q[1])); let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); cands.push({ k, nm: r.nm, pts, L }) }
    cands.sort((a, b) => kinds.indexOf(a.k) - kinds.indexOf(b.k) || b.L - a.L)
    const lastByName = new Map()
    for (const c of cands) {
      const s = abbr(c.nm); const Wt = g.measureText(s).width; if (Wt + 16 > c.L) continue
      let pts = c.pts; if (pts[pts.length - 1][0] < pts[0][0]) pts = pts.slice().reverse()
      const cl = [0]; for (let i = 1; i < pts.length; i++) cl.push(cl[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
      const at = d => { for (let i = 1; i < pts.length; i++) if (cl[i] >= d) { const u = (d - cl[i - 1]) / ((cl[i] - cl[i - 1]) || 1); return [pts[i - 1][0] + u * (pts[i][0] - pts[i - 1][0]), pts[i - 1][1] + u * (pts[i][1] - pts[i - 1][1]), Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0])] } const n = pts.length - 1; return [pts[n][0], pts[n][1], Math.atan2(pts[n][1] - pts[n - 1][1], pts[n][0] - pts[n - 1][0])] }
      let d = (c.L - Wt) / 2; const gl = []; let prev = null, bad = false
      for (const ch of s) { const cw = g.measureText(ch).width; const [x, y, a] = at(d + cw / 2); if (prev !== null) { let da = Math.abs(a - prev); if (da > Math.PI) da = 2 * Math.PI - da; if (da > 0.6) { bad = true; break } } prev = a; gl.push([ch, x, y, a]); d += cw }
      if (bad || !gl.length) continue
      const xs = gl.map(q => q[1]), ys = gl.map(q => q[2]); const b = { x0: Math.min(...xs) - 10, x1: Math.max(...xs) + 10, y0: Math.min(...ys) - 10, y1: Math.max(...ys) + 10 }
      // mesmo nome repetido só bem longe (como no Google Maps)
      const prevB = lastByName.get(c.nm); if (prevB && prevB.some(p => Math.hypot((p.x0 + p.x1) / 2 - (b.x0 + b.x1) / 2, (p.y0 + p.y1) / 2 - (b.y0 + b.y1) / 2) < labels.repeat)) continue
      if (hit(b)) continue
      add(b); (lastByName.get(c.nm) || lastByName.set(c.nm, []).get(c.nm)).push(b)
      for (const pass of [0, 1]) for (const [ch, x, y, a] of gl) { g.save(); g.translate(x, y); g.rotate(a); if (pass === 0) { g.lineWidth = 3.5; g.strokeStyle = T.halo; g.strokeText(ch, 0, 0) } else { g.fillStyle = T.label; g.fillText(ch, 0, 0) } g.restore() }
    }
  }
  const tiles = []
  const t = document.createElement('canvas'); t.width = TILE; t.height = TILE; const tg = t.getContext('2d')
  for (let ty = 0; ty < H / TILE; ty++) for (let tx = 0; tx < W / TILE; tx++) { tg.drawImage(cv, tx * TILE, ty * TILE, TILE, TILE, 0, 0, TILE, TILE); tiles.push([tx, ty, t.toDataURL('image/png').split(',')[1]]) }
  return { W, H, cols: W / TILE, rows: H / TILE, tiles }
}
