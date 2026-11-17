const {chromium}=require('playwright');const fs=require('fs');const path=require('path')
const STR=JSON.parse(fs.readFileSync('../streets.json','utf8'))
const BB=[-20.0404,-44.0714,-19.7642,-43.8506],TILE=256
const LEVELS=[{K:40,labels:null,smallMinK:70},{K:80,labels:{kinds:['big','mid'],size:12,repeat:700},smallMinK:70},{K:160,labels:{kinds:['big','mid','small'],size:12.5,repeat:900},smallMinK:70}]
;(async()=>{const b=await chromium.launch();const p=await b.newPage();await p.setContent('<html><body></body></html>');await p.addScriptTag({path:'render.js'})
 const manifest={version:1,generated:new Date().toISOString().slice(0,10),projection:{type:'equirectangular',mPerDeg:111320,latRef:(BB[0]+BB[2])/2,origin:{lat:BB[2],lon:BB[1]},note:'x = (lon - origin.lon) * mPerDeg * cos(latRef) * pxPerKm / 1000; y = (origin.lat - lat) * mPerDeg * pxPerKm / 1000'},bbox:{south:BB[0],west:BB[1],north:BB[2],east:BB[3]},tileSize:TILE,themes:{},attribution:'© colaboradores do OpenStreetMap (ODbL)'}
 for(const theme of ['dark','light']){manifest.themes[theme]={levels:[]}
  for(const L of LEVELS){const r=await p.evaluate(([S,o])=>window.renderLevel(S,o),[STR,{...L,BB,TILE,theme}])
   const dir=path.join('out',theme,String(L.K));fs.mkdirSync(dir,{recursive:true});let bytes=0
   for(const [tx,ty,b64] of r.tiles){const f=path.join(dir,`${tx}_${ty}.png`);fs.writeFileSync(f,Buffer.from(b64,'base64'))}
   manifest.themes[theme].levels.push({pxPerKm:L.K,cols:r.cols,rows:r.rows,width:r.W,height:r.H,path:`${theme}/${L.K}/{x}_{y}.png`})
   console.log(theme,L.K,r.cols+'x'+r.rows)}}
 fs.writeFileSync('out/manifest.json',JSON.stringify(manifest,null,1));await b.close()})()
