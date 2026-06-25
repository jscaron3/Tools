let W=1800,H=600;
let parsedSegs=[];
let resolvedSegs=[];
let renderState={scaleX:1,scaleY:1,offsetX:0,offsetY:0};
let ptMap=new Map();
let dragState=null;
let panState=null;
let vpT={tx:0,ty:0,s:1};
let vpGroup=null;
 
const svgEl=document.getElementById("svg");
const iW=document.getElementById("iW");
const iH=document.getElementById("iH");
 
function updateSize(){W=parseFloat(iW.value)||1;H=parseFloat(iH.value)||1;doParse();}
iW.addEventListener("input",updateSize);
iH.addEventListener("input",updateSize);
 
function applyVP(){
  if(!vpGroup)return;
  vpGroup.setAttribute("transform",`translate(${vpT.tx},${vpT.ty}) scale(${vpT.s})`);
  const ra=(4.5/vpT.s).toFixed(4);
  const rc=(3.5/vpT.s).toFixed(4);
  vpGroup.querySelectorAll(".node-a").forEach(c=>c.setAttribute("r",ra));
  vpGroup.querySelectorAll(".node-c").forEach(c=>c.setAttribute("r",rc));
  document.getElementById("sZoom").textContent=Math.round(vpT.s*100)+"%";
}
function resetVP(){vpT={tx:0,ty:0,s:1};applyVP();}
 
function evalVal(v,axis){
  if(v==null||v==="")return 0;
  if(typeof v==="number")return v;
  v=String(v).trim();
  const size=axis==="x"?W:H;
  if(v.endsWith("%"))return parseFloat(v)/100*size;
  if(v.endsWith("px"))return parseFloat(v);
  if(v.toLowerCase().startsWith("calc("))return evalCalc(v,axis);
  const n=parseFloat(v);
  return isNaN(n)?0:n;
}
function evalCalc(v,axis){
  let expr=v.replace(/^\s*calc\(\s*/i,"").replace(/\s*\)\s*$/,"");
  expr=expr.replace(/calc\([^)]*\)/gi,m=>evalCalc(m,axis));
  expr=expr.replace(/(\d+(?:\.\d+)?)\s*%/g,(_,n)=>{
    const size=axis==="x"?W:H;
    return (parseFloat(n)/100*size).toFixed(8);
  });
  expr=expr.replace(/(\d+(?:\.\d+)?)\s*px/gi,(_,n)=>parseFloat(n));
  expr=expr.replace(/[^0-9+\-*/(). e]/g,"");
  try{return Function(`"use strict"; return (${expr});`)();}
  catch{return 0;}
}
const rx=v=>evalVal(v,"x");
const ry=v=>evalVal(v,"y");
 
function tokenize(str){
  const tokens=[];let buf="",depth=0;
  for(const ch of str){
    if(ch==="(")depth++;if(ch===")")depth--;
    if((ch===" "||ch==="\t")&&depth===0){if(buf){tokens.push(buf);buf="";}}else buf+=ch;
  }
  if(buf)tokens.push(buf);return tokens;
}
function splitCommas(str){
  const out=[];let buf="",depth=0;
  for(const ch of str){
    if(ch==="(")depth++;if(ch===")")depth--;
    if(ch===","&&depth===0){out.push(buf.trim());buf="";}else buf+=ch;
  }
  if(buf.trim())out.push(buf.trim());return out;
}
 
function parseShape(raw){
  const norm=raw.replace(/\n|\r/g," ").replace(/\s+/g," ").trim();
  const m=norm.match(/shape\(\s*([\s\S]*?)\s*\)$/i);
  if(!m)return[];
  return splitCommas(m[1]).map(seg=>{
    seg=seg.trim();
    if(/^from\s/i.test(seg)){
      const toks=tokenize(seg.replace(/^from\s+/i,""));
      return{t:"from",rx:toks[0],ry:toks[1]};
    }
    if(/^hline\s+to\s/i.test(seg)){
      const toks=tokenize(seg.replace(/^hline\s+to\s+/i,""));
      return{t:"hline",rx:toks[0]};
    }
    if(/^vline\s+to\s/i.test(seg)){
      const toks=tokenize(seg.replace(/^vline\s+to\s+/i,""));
      return{t:"vline",ry:toks[0]};
    }
    if(/^line\s+to\s/i.test(seg)){
      const toks=tokenize(seg.replace(/^line\s+to\s+/i,""));
      return{t:"line",rx:toks[0],ry:toks[1]};
    }
    if(/^curve\s+to\s/i.test(seg)){
      const withIdx=seg.search(/\bwith\b/i);
      if(withIdx===-1)return{t:"unknown",raw:seg};
      const endStr=seg.slice(seg.search(/\bto\b/i)+2,withIdx).trim();
      const withStr=seg.slice(withIdx+4).trim();
      const slashIdx=findTopLevelSlash(withStr);
      if(slashIdx===-1)return{t:"unknown",raw:seg};
      const c1str=withStr.slice(0,slashIdx).trim();
      const c2str=withStr.slice(slashIdx+1).trim();
      const endToks=tokenize(endStr);
      const c1Toks=tokenize(c1str);
      const c2Toks=tokenize(c2str);
      return{t:"curve",rx:endToks[0],ry:endToks[1],rcx1:c1Toks[0],rcy1:c1Toks[1],rcx2:c2Toks[0],rcy2:c2Toks[1]};
    }
    if(/^close$/i.test(seg))return{t:"close"};
    return{t:"unknown",raw:seg};
  });
}
function findTopLevelSlash(str){
  let depth=0;
  for(let i=0;i<str.length;i++){
    if(str[i]==="(")depth++;if(str[i]===")")depth--;
    if(str[i]==="/"&&depth===0)return i;
  }
  return -1;
}
 
function resolveSegs(segs){
  const out=[];let cx=0,cy=0;
  for(const s of segs){
    if(s.t==="from"){cx=rx(s.rx);cy=ry(s.ry);out.push({...s,x:cx,y:cy});}
    else if(s.t==="line"){cx=rx(s.rx);cy=ry(s.ry);out.push({...s,x:cx,y:cy});}
    else if(s.t==="hline"){cx=rx(s.rx);out.push({...s,x:cx,y:cy});}
    else if(s.t==="vline"){cy=ry(s.ry);out.push({...s,x:cx,y:cy});}
    else if(s.t==="curve"){
      const x=rx(s.rx),y=ry(s.ry);
      const cx1=rx(s.rcx1),cy1=ry(s.rcy1);
      const cx2=rx(s.rcx2),cy2=ry(s.rcy2);
      cx=x;cy=y;
      out.push({...s,x,y,cx1,cy1,cx2,cy2});
    }
    else out.push({...s});
  }
  return out;
}
 
function repropagate(segs){
  let cx=0,cy=0;
  for(const s of segs){
    if(s.t==="from"){cx=s.x;cy=s.y;}
    else if(s.t==="line"){cx=s.x;cy=s.y;}
    else if(s.t==="hline"){s.y=cy;cx=s.x;}
    else if(s.t==="vline"){s.x=cx;cy=s.y;}
    else if(s.t==="curve"){cx=s.x;cy=s.y;}
  }
}
 
// ─── Smart token formatter ────────────────────────────────────────────────────
// For a resolved px value on a given axis:
//   > 50% of dimension  →  calc(100% - Xpx)
//   ≤ 50% of dimension  →  Xpx
// kind: "calc" | "pct" | "px"
function tokenKind(tok) {
  if (!tok) return "px";
  const t = String(tok).trim();
  if (t.toLowerCase().startsWith("calc(")) return "calc";
  if (t.endsWith("%")) return "pct";
  return "px";
}
 
// Smart formatter — respects the output mode and original token's unit family.
//   mode "pct"           →  always output as X%
//   mode "calc" or "px"  →  x > 50%: calc(100% - Xpx), else Xpx
function smartToken(pxVal, axis, kind) {
  const size = axis === "x" ? W : H;
  const n = +pxVal;
  const mode = document.getElementById("preset").value || "calc";
  // If output mode is %, always use %
  if (mode === "pct") {
    const pct = +(n / size * 100).toFixed(4);
    return pct + "%";
  }
  // calc/px mode
  if (n > size / 2) {
    const diff = +(size - n).toFixed(4);
    if (diff === 0) return "100%";
    return `calc(100% - ${diff}px)`;
  }
  return +n.toFixed(4) + "px";
}
 
// Pick the right output token for a given prop:
//  - if dragged: smartToken (uses current output mode)
//  - if not dragged + original was calc() or %: smartToken (re-express in current mode)
//  - if not dragged + original was bare px: preserve verbatim
//  - exact edge values (0%, 100%, 0px): preserved
function bestToken(pxVal, origTok, axis, wasDragged) {
  const t = origTok ? String(origTok).trim() : null;
  const kind = tokenKind(t);
 
  if (!wasDragged) {
    if (!t) return smartToken(pxVal, axis, kind);
    if (t === "0%" || t === "0px" || t === "0") return "0px";
    if (t === "100%") return "100%";
    if (kind === "calc" || kind === "pct") return smartToken(pxVal, axis, kind);
    // bare px — preserve original string
    return t;
  }
  return smartToken(pxVal, axis, kind);
}
 
function exportSmart(parsedArr, resolvedArr) {
  let out = "shape(";
  for (let i = 0; i < resolvedArr.length; i++) {
    const s = resolvedArr[i];
    const p = parsedArr[i] || {};
    const od = s._dragged || {};
 
    if (s.t === "from") {
      out += `from ${bestToken(s.x,p.rx,"x",od.x)} ${bestToken(s.y,p.ry,"y",od.y)},`;
    }
    else if (s.t === "line") {
      out += `line to ${bestToken(s.x,p.rx,"x",od.x)} ${bestToken(s.y,p.ry,"y",od.y)},`;
    }
    else if (s.t === "hline") {
      out += `hline to ${bestToken(s.x,p.rx,"x",od.x)},`;
    }
    else if (s.t === "vline") {
      out += `vline to ${bestToken(s.y,p.ry,"y",od.y)},`;
    }
    else if (s.t === "curve") {
      const ex  = bestToken(s.x,   p.rx,   "x", od.x);
      const ey  = bestToken(s.y,   p.ry,   "y", od.y);
      const cx1 = bestToken(s.cx1, p.rcx1, "x", od.cx1);
      const cy1 = bestToken(s.cy1, p.rcy1, "y", od.cy1);
      const cx2 = bestToken(s.cx2, p.rcx2, "x", od.cx2);
      const cy2 = bestToken(s.cy2, p.rcy2, "y", od.cy2);
      out += `curve to ${ex} ${ey} with ${cx1} ${cy1}/${cx2} ${cy2},`;
    }
    else if (s.t === "close") out += "close,";
    else if (s.t === "unknown") out += (s.raw || "") + ",";
  }
  return out.replace(/,$/, "") + ")";
}
 
// ─── Coordinate helpers ───────────────────────────────────────────────────────
function clientToSVGRoot(clientX,clientY){
  const pt=svgEl.createSVGPoint();pt.x=clientX;pt.y=clientY;
  return pt.matrixTransform(svgEl.getScreenCTM().inverse());
}
function clientToGroupSpace(clientX,clientY){
  const pt=svgEl.createSVGPoint();pt.x=clientX;pt.y=clientY;
  return pt.matrixTransform(vpGroup.getScreenCTM().inverse());
}
function groupToShape(gx,gy){
  const{scaleX,scaleY,offsetX,offsetY}=renderState;
  return{x:(gx-offsetX)/scaleX,y:(gy-offsetY)/scaleY};
}
function clampX(v){return Math.max(0,Math.min(W,v));}
function clampY(v){return Math.max(0,Math.min(H,v));}
 
// ─── Render ───────────────────────────────────────────────────────────────────
function render(){
  svgEl.innerHTML="";
  const cw=document.getElementById("canvas-wrap");
  const vw=cw.clientWidth||800;
  const vh=cw.clientHeight||600;
  const pad=40;
  const scale=Math.min((vw-pad*2)/W,(vh-pad*2)/H);
  const offsetX=(vw-W*scale)/2;
  const offsetY=(vh-H*scale)/2;
  renderState={scaleX:scale,scaleY:scale,offsetX,offsetY};
  const sx=v=>offsetX+v*scale;
  const sy=v=>offsetY+v*scale;
 
  const g=document.createElementNS("http://www.w3.org/2000/svg","g");
  vpGroup=g;svgEl.appendChild(g);applyVP();
 
  let d="";
  for(const s of resolvedSegs){
    if(s.t==="from") d+=`M ${sx(s.x)} ${sy(s.y)} `;
    if(s.t==="line") d+=`L ${sx(s.x)} ${sy(s.y)} `;
    if(s.t==="hline")d+=`L ${sx(s.x)} ${sy(s.y)} `;
    if(s.t==="vline")d+=`L ${sx(s.x)} ${sy(s.y)} `;
    if(s.t==="curve")d+=`C ${sx(s.cx1)} ${sy(s.cy1)} ${sx(s.cx2)} ${sy(s.cy2)} ${sx(s.x)} ${sy(s.y)} `;
    if(s.t==="close")d+="Z ";
  }
  const path=document.createElementNS("http://www.w3.org/2000/svg","path");
  path.setAttribute("d",d.trim());path.classList.add("shape-path");g.appendChild(path);
 
  let penX=0,penY=0;
  for(const s of resolvedSegs){
    const endX=sx(s.x??0),endY=sy(s.y??0);
    if(s.t==="curve"){mkLine(g,penX,penY,sx(s.cx1),sy(s.cy1));mkLine(g,endX,endY,sx(s.cx2),sy(s.cy2));}
    if(s.t!=="close"){penX=endX;penY=endY;}
  }
 
  ptMap=new Map();const pts=[];let id=0;
  resolvedSegs.forEach((s,segIdx)=>{
    if(["from","line","hline","vline"].includes(s.t)){
      pts.push({id,x:sx(s.x),y:sy(s.y),px:s.x,py:s.y,kind:"a",label:s.t});
      ptMap.set(id,{segIdx,xProp:"x",yProp:"y",type:s.t});id++;
    }
    if(s.t==="curve"){
      pts.push({id,x:sx(s.cx1),y:sy(s.cy1),px:s.cx1,py:s.cy1,kind:"c",label:"ctrl-1"});
      ptMap.set(id,{segIdx,xProp:"cx1",yProp:"cy1",type:"curve-ctrl"});id++;
      pts.push({id,x:sx(s.cx2),y:sy(s.cy2),px:s.cx2,py:s.cy2,kind:"c",label:"ctrl-2"});
      ptMap.set(id,{segIdx,xProp:"cx2",yProp:"cy2",type:"curve-ctrl"});id++;
      pts.push({id,x:sx(s.x),y:sy(s.y),px:s.x,py:s.y,kind:"a",label:"curve"});
      ptMap.set(id,{segIdx,xProp:"x",yProp:"y",type:"curve"});id++;
    }
  });
 
  const baseRa=(4.5/vpT.s).toFixed(4);
  const baseRc=(3.5/vpT.s).toFixed(4);
  pts.forEach(p=>{
    const c=document.createElementNS("http://www.w3.org/2000/svg","circle");
    c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);
    c.setAttribute("r",p.kind==="a"?baseRa:baseRc);
    c.classList.add(p.kind==="a"?"node-a":"node-c");
    c.dataset.id=p.id;
    c.addEventListener("mouseenter",()=>{if(!dragState)hl(p.id,true);});
    c.addEventListener("mouseleave",()=>{if(!dragState)hl(p.id,false);});
    g.appendChild(c);
  });
 
  renderSidebar(pts);
}
 
function mkLine(parent,x1,y1,x2,y2){
  const l=document.createElementNS("http://www.w3.org/2000/svg","line");
  l.setAttribute("x1",x1);l.setAttribute("y1",y1);l.setAttribute("x2",x2);l.setAttribute("y2",y2);
  l.classList.add("ctrl-line");parent.appendChild(l);
}
 
function renderSidebar(pts){
  const container=document.getElementById("panel-points");
  container.querySelectorAll(".pt").forEach(n=>n.remove());
  pts.forEach(p=>{
    const div=document.createElement("div");
    div.className="pt";div.dataset.id=p.id;
    div.innerHTML=`<span class="lbl">#${p.id} ${p.label}</span><br><span class="coords">${fmtN(p.px)}, ${fmtN(p.py)}</span>`;
    div.addEventListener("mouseenter",()=>{if(!dragState)hl(p.id,true);});
    div.addEventListener("mouseleave",()=>{if(!dragState)hl(p.id,false);});
    container.appendChild(div);
  });
}
function fmtN(n){return typeof n==="number"?n.toFixed(2)+"px":String(n);}
 
function hl(id,on){
  if(vpGroup)vpGroup.querySelectorAll("circle").forEach(c=>{if(+c.dataset.id===id)c.classList.toggle("hl",on);});
  document.querySelectorAll(".pt").forEach(d=>{if(+d.dataset.id===id)d.classList.toggle("hl",on);});
}
 
// ─── Pointer events ───────────────────────────────────────────────────────────
svgEl.addEventListener("mousedown",e=>{
  const circle=e.target.closest("circle");
  if(circle){
    e.preventDefault();
    const id=+circle.dataset.id;
    const info=ptMap.get(id);
    if(!info)return;
    dragState={pointId:id,...info};
    svgEl.style.cursor="grabbing";
  }else{
    if(e.button!==0)return;
    e.preventDefault();
    panState={startX:e.clientX,startY:e.clientY,startTx:vpT.tx,startTy:vpT.ty};
    svgEl.style.cursor="move";
  }
});
 
window.addEventListener("mousemove",e=>{
  if(dragState){
    e.preventDefault();
    const gpt=clientToGroupSpace(e.clientX,e.clientY);
    const shaped=groupToShape(gpt.x,gpt.y);
    const seg=resolvedSegs[dragState.segIdx];
 
    if(dragState.type==="hline"){
      seg.x=clampX(shaped.x);
      if(!seg._dragged)seg._dragged={};seg._dragged.x=true;
    }else if(dragState.type==="vline"){
      seg.y=clampY(shaped.y);
      if(!seg._dragged)seg._dragged={};seg._dragged.y=true;
    }else{
      seg[dragState.xProp]=clampX(shaped.x);
      seg[dragState.yProp]=clampY(shaped.y);
      if(!seg._dragged)seg._dragged={};
      seg._dragged[dragState.xProp]=true;
      seg._dragged[dragState.yProp]=true;
    }
 
    repropagate(resolvedSegs);
    document.getElementById("ta-output").value=exportSmart(parsedSegs,resolvedSegs);
    render();
    hl(dragState.pointId,true);
  }else if(panState){
    vpT.tx=panState.startTx+(e.clientX-panState.startX);
    vpT.ty=panState.startTy+(e.clientY-panState.startY);
    applyVP();
  }
});
 
window.addEventListener("mouseup",()=>{dragState=null;panState=null;svgEl.style.cursor="";});
 
svgEl.addEventListener("wheel",e=>{
  e.preventDefault();
  const ZOOM_SPEED=0.0008;
  const rawFactor=1-e.deltaY*ZOOM_SPEED;
  const newScale=Math.max(0.05,Math.min(20,vpT.s*rawFactor));
  const clampedF=newScale/vpT.s;
  const pivot=clientToSVGRoot(e.clientX,e.clientY);
  vpT.tx=pivot.x+(vpT.tx-pivot.x)*clampedF;
  vpT.ty=pivot.y+(vpT.ty-pivot.y)*clampedF;
  vpT.s=newScale;
  applyVP();
},{passive:false});
 
svgEl.addEventListener("dblclick",e=>{if(!e.target.closest("circle"))resetVP();});
 
// ─── Main actions ─────────────────────────────────────────────────────────────
function doParse(){
  W=+document.getElementById("iW").value||800;
  H=+document.getElementById("iH").value||600;
  document.getElementById("sW").textContent=W;
  document.getElementById("sH").textContent=H;
  const raw=document.getElementById("ta-input").value.trim();
  if(!raw)return;
  parsedSegs=parseShape(raw);
  resolvedSegs=resolveSegs(parsedSegs);
  resolvedSegs.forEach(s=>delete s._dragged);
  document.getElementById("ta-output").value=exportSmart(parsedSegs,resolvedSegs);
  resetVP();
  render();
}
 
function doCopy(){
  const text=document.getElementById("ta-output").value;
  if(!text)return;
  navigator.clipboard.writeText(text).then(()=>{
    const t=document.getElementById("toast");
    t.classList.add("show");
    setTimeout(()=>t.classList.remove("show"),1400);
  });
}
 
const PRESETS={
  calc:`shape(from calc(100% - 30.0211px) 0%,curve to 100% 29.9739px with calc(100% - 13.3829px) 0%/100% 13.4487px,vline to calc(100% - 178.1733px),curve to calc(100% - 12.47865px) calc(100% - 156.5499px) with 100% calc(100% - 169.2954px)/calc(100% - 4.7021px) calc(100% - 161.0328px),line to calc(100% - 277.7856px) calc(100% - 3.3402px),curve to calc(100% - 290.26425px) 100% with calc(100% - 281.58345px) calc(100% - 1.1427px)/calc(100% - 285.92385px) 100%,hline to 30.0211px,curve to 0% calc(100% - 29.9739px) with 13.3829px 100%/0% calc(100% - 13.4487px),vline to 178.0854px,curve to 12.47865px 156.462px with 0% 169.2075px/4.7021px 160.9449px,line to 277.7856px 3.3402px,curve to 290.26425px 0% with 281.58345px 1.1427px/285.743px 0%,hline to calc(100% - 30.0211px),close)`,
};
 
document.getElementById("preset").addEventListener("change",function(){
  if(resolvedSegs.length){
    document.getElementById("ta-output").value=exportSmart(parsedSegs,resolvedSegs);
  }
});
 
new ResizeObserver(()=>{if(resolvedSegs.length)render();}).observe(document.getElementById("canvas-wrap"));
document.getElementById("ta-input").value=PRESETS.calc;
document.getElementById("preset").value="calc";
doParse();