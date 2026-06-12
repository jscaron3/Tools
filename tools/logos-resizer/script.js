let CANVAS_W=400,CANVAS_H=300,items=[];
const dlAll=document.getElementById('download-all');
dlAll.addEventListener('click',()=>downloadAll());
const applySize=document.getElementById('apply-size');
applySize.addEventListener('click',()=>applyCanvasSize());
const upload=document.getElementById('upload');
const dropZone=document.getElementById('dropZone');

function handleFiles(fileList){
  [...fileList].forEach(file=>{
    const img=new Image();
    img.onload=()=>{
      const item={fileName:file.name.replace(/\.[^/.]+$/,''),ext:file.name.split('.').pop().toLowerCase(),img,
        ogWidth:img.naturalWidth,ogHeight:img.naturalHeight,scale:100,x:50,y:50,rotation:0,canvas:null,ctx:null,card:null};
      items.push(item);createCard(item);
    };
    img.src=URL.createObjectURL(file);
  });
}

upload.onchange=e=>{handleFiles(e.target.files);upload.value='';};
document.addEventListener('dragover',e=>e.preventDefault());
document.addEventListener('drop',e=>e.preventDefault());
dropZone.addEventListener('click',()=>upload.click());
dropZone.addEventListener('dragover',e=>{e.preventDefault();dropZone.classList.add('dragover');});
dropZone.addEventListener('dragleave',()=>dropZone.classList.remove('dragover'));
dropZone.addEventListener('drop',e=>{e.preventDefault();dropZone.classList.remove('dragover');if(e.dataTransfer.files.length)handleFiles(e.dataTransfer.files);});

function createCard(item){
  item.allowUpscale=false;
  const card=document.createElement('div');
  card.className='card';

  let ogSize='';
  if(item.ogWidth&&item.ogHeight) ogSize=`<span style="opacity:0.5;margin:0 2px;">·</span><span class="file-sizes">${item.ogWidth} × ${item.ogHeight}</span>`;

  card.innerHTML=`
    <div class="card-top">
      <div class="file-meta">
        <div class="filename"><span contenteditable="true">${item.fileName}</span></div>
        <div class="file-infos"><span class="filetype">${item.ext}</span>${ogSize}</div>
        <div class="rendered-sizes" style="margin-top:2px;">Rendered: <span class="rendered-w">—</span> × <span class="rendered-h">—</span></div>
      </div>
      <div class="card-actions">
        <button class="card-action-btn download-one" title="Download">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="currentColor"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></g></svg>
        </button>
        <button class="card-action-btn reset-size" title="Reset">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none"><path d="M13 3a9 9 0 0 0-9 9H1l4 3.99L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12z" fill="currentColor"/></g></svg>
        </button>
        <button class="card-action-btn danger delete-btn" title="Delete">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><g fill="none"><path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>
        </button>
      </div>
    </div>
    <div class="canvas-wrap">
      <span class="v-pos-guides"></span>
      <span class="h-pos-guides"></span>
      <canvas></canvas>
    </div>
    <div class="controls">
      <div class="scale-dragger" data-scale-drag><div class="knob"></div></div>
      <span class="topbar-label" style="display:block;margin-top:2px;">Position X</span>
      <input id="x-pos" type="range" min="-50" max="150" value="50" data-key="x">
      <span class="topbar-label">Position Y</span>
      <input id="y-pos" type="range" min="-50" max="150" value="50" data-key="y">
      <div class="controls-row" style="margin-top:4px;">
        <div class="allow-upscale-row">
          <input id="allowUpscale" type="checkbox" data-key="allowUpscale">
          <label for="allowUpscale">Allow upscale</label>
        </div>
        <button type="button" class="fit-btn" data-fit="contain">Contain</button>
        <button type="button" class="fit-btn" data-fit="cover">Cover</button>
        <span class="rotate-btn" title="Rotate 90°">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"><path fill="currentColor" d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg>
        </span>
      </div>
    </div>`;

  const canvas=card.querySelector('canvas');
  canvas.width=CANVAS_W;canvas.height=CANVAS_H;
  item.canvas=canvas;item.ctx=canvas.getContext('2d');item.card=card;

  card.querySelector('.controls').addEventListener('input',e=>{
    const key=e.target.dataset.key;if(!key)return;
    if(e.target.type==='checkbox')item[key]=e.target.checked;
    else item[key]=parseInt(e.target.value);
    draw(item);
  });

  item.scaleValue=0;item.baseScale=0;item.dragOffset=0;item.fitMode='none';item.fitBaseScale=null;

  const drag=card.querySelector('[data-scale-drag]');
  const knob=drag.querySelector('.knob');
  let dragging=false,startX=0;

  function updateKnob(){
    const width=drag.offsetWidth,offset=item.dragOffset;
    const percent=0.5+offset/width;
    knob.style.left=Math.max(Math.min(percent*100,100),0)+'%';
  }

  drag.addEventListener('mousedown',e=>{dragging=true;startX=e.clientX;});

  window.addEventListener('mousemove',e=>{
    if(!dragging)return;
    const dx=e.clientX-startX;startX=e.clientX;
    item.dragOffset+=dx;
    if(item.dragOffset>200){const excess=item.dragOffset-200;item.dragOffset=200+Math.sign(excess)*Math.pow(Math.abs(excess),1.00001);}
    else if(item.dragOffset<-200){const excess=item.dragOffset+200;item.dragOffset=-200+Math.sign(excess)*Math.pow(Math.abs(excess),1.00001);}
    updateKnob();draw(item);
  });

  window.addEventListener('mouseup',()=>{
    if(!dragging)return;dragging=false;
    item.baseScale+=item.dragOffset;item.dragOffset=0;
    updateKnob();
  });

  card.querySelectorAll('[data-fit]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const imgW=item.img.width,imgH=item.img.height;
      let fitScale=btn.dataset.fit==='contain'?Math.min(CANVAS_W/imgW,CANVAS_H/imgH):Math.max(CANVAS_W/imgW,CANVAS_H/imgH);
      item.fitBaseScale=fitScale;item.baseScale=1;item.dragOffset=0;
      draw(item);
    });
  });

  card.querySelector('.rotate-btn').onclick=()=>{item.rotation=(item.rotation+90)%360;draw(item);};

  card.querySelector('.reset-size').onclick=()=>{
    item.baseScale=0;item.scaleValue=0;item.x=50;item.y=50;item.fitBaseScale=null;item.dragOffset=0;
    const inputs=card.querySelectorAll('[data-key]');
    inputs.forEach(i=>{if(i.type==='range')i.value=50;if(i.type==='checkbox')i.checked=false;});
    draw(item);
  };

  card.querySelector('.delete-btn').onclick=()=>removeItem(item);
  card.querySelector('.download-one').onclick=()=>downloadOne(item);

  grid.appendChild(card);draw(item);
}

function removeItem(item){items=items.filter(x=>x!==item);item.card.remove();}

function applyCanvasSize(){
  CANVAS_W=parseInt(cw.value)||400;CANVAS_H=parseInt(ch.value)||300;
  items.forEach(item=>{item.canvas.width=CANVAS_W;item.canvas.height=CANVAS_H;draw(item);});
}

async function draw(item){
  const ctx=item.ctx,canvas=item.canvas;
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  let bgColor=document.querySelector('input[name="bg-color"]:checked').value;
  ctx.fillStyle=bgColor==='transparent'?'transparent':bgColor;
  ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
  const imgW=item.img.width,imgH=item.img.height;
  let base=item.fitBaseScale!==null?item.fitBaseScale:1;
  let interactive=item.baseScale+item.dragOffset;
  let scale;
  if(interactive>=0)scale=Math.min(3,base*(1+interactive/CANVAS_H));
  else scale=Math.max(0.01,base*(1+interactive/CANVAS_W));
  let maxReached=false;
  if(!item.allowUpscale&&['png','jpg','jpeg','avif','webp'].includes(item.ext)){if(scale>1){scale=1;maxReached=true;}}
  const w=item.img.width*scale,h=item.img.height*scale;
  let rw=card_rw=item.card.querySelector('.rendered-w'),rh=item.card.querySelector('.rendered-h');
  rw.textContent=parseFloat(w).toFixed(1).replace(/\.?0+$/,'');
  rh.textContent=parseFloat(h).toFixed(1).replace(/\.?0+$/,'');
  let overflowX=w-CANVAS_W,overflowY=h-CANVAS_H;
  let px=Math.min(150,Math.max(-50,item.x))/100,py=Math.min(150,Math.max(-50,item.y))/100;
  let cx,cy;
  if(CANVAS_W>=imgW)cx=(CANVAS_W-w)*px;else cx=-(overflowX*px);
  if(CANVAS_H>=imgH)cy=(CANVAS_H-h)*py;else cy=-(overflowY*py);
  ctx.save();
  const centerX=cx+w/2,centerY=cy+h/2;
  ctx.translate(centerX,centerY);
  ctx.rotate(item.rotation*Math.PI/180);
  if(document.querySelector('.smoothing-checkbox').checked){ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';}
  ctx.drawImage(item.img,-w/2,-h/2,w,h);
  ctx.restore();
  canvas.style.border=maxReached?'1.5px solid #ef4444':'1px solid rgba(0,0,0,0.10)';
}

function getExportData(item){
  const sel=exportFormat.value;
  if(sel==='png')return{mime:'image/png',ext:'png'};
  if(sel==='jpeg')return{mime:'image/jpeg',ext:'jpg'};
  if(['jpg','jpeg'].includes(item.ext))return{mime:'image/jpeg',ext:'jpg'};
  return{mime:'image/png',ext:'png'};
}

function getExportCanvas(item,type){
  if(type.mime!=='image/jpeg'&&type.mime!=='image/png')return item.canvas;
  const temp=document.createElement('canvas');
  temp.width=CANVAS_W;temp.height=CANVAS_H;
  const tctx=temp.getContext('2d');
  let bgColor=document.querySelector('input[name="bg-color"]:checked').value;
  tctx.fillStyle=(type.mime==='image/jpeg'&&bgColor==='transparent')?'#ffffff':bgColor;
  tctx.fillRect(0,0,CANVAS_W,CANVAS_H);
  tctx.drawImage(item.canvas,0,0);return temp;
}

async function downloadOne(item){
  await draw(item);
  const type=getExportData(item);
  const exportCanvas=getExportCanvas(item,type);
  const name=item.card.querySelector('.filename').textContent||item.fileName;
  let out=name!=item.fileName?name:item.fileName;
  out=out.trim().replaceAll(' ','-');
  exportCanvas.toBlob(blob=>saveAs(blob,out+'.'+type.ext),type.mime,0.95);
}

async function downloadAll(){
  const zip=new JSZip();
  items.forEach(async item=>{
    await draw(item);
    const type=getExportData(item);
    const exportCanvas=getExportCanvas(item,type);
    const base64=exportCanvas.toDataURL(type.mime,0.95).split(',')[1];
    const name=item.card.querySelector('.filename').textContent||item.fileName;
    let out=name!=item.fileName?name:item.fileName;
    out=out.trim().replaceAll(' ','-');
    zip.file(out+'.'+type.ext,base64,{base64:true});
  });
  const blob=await zip.generateAsync({type:'blob'});
  saveAs(blob,'logos.zip');
}

function updateAllCanvas(){items.forEach(item=>draw(item));}

document.querySelectorAll('input[name="bg-color"]').forEach(el=>el.addEventListener('change',()=>updateAllCanvas()));
document.getElementById('smoothing').addEventListener('change',()=>updateAllCanvas());

const picker=document.querySelector('.custom-picker .color-input');
const pickerRadio=document.querySelector('.custom-picker input[type="radio"]');
const pickerPreview=document.querySelector('.picker');

picker.addEventListener('input',e=>{
  const color=e.target.value;
  pickerPreview.style.background=color;
  pickerRadio.value=color;pickerRadio.checked=true;
  updateAllCanvas();
});

// Guides
const EDGE_HIT=20,HIT_THICK=8;
let W=window.innerWidth,H=window.innerHeight;
const overlay=document.getElementById('guide-overlay');
let guides=[],selectedGuide=null,guideDragging=null;
function genId(){return Math.random().toString(36).slice(2);}

function createGuide(type,pos){
  const id=genId();
  const container=document.createElement('div');
  container.className=`g-guide ${type}`;
  const line=document.createElement('div');line.className=`g-line ${type}`;
  const hit=document.createElement('div');hit.className=`g-hit ${type}`;
  const label=document.createElement('div');label.className='g-label';
  container.appendChild(line);container.appendChild(hit);container.appendChild(label);
  overlay.appendChild(container);
  const guide={id,type,pos,line,hit,label,container};
  guides.push(guide);
  label.addEventListener('mousedown',e=>{e.preventDefault();e.stopPropagation();});
  label.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();toggleLockGuide(guide);});
  hit.addEventListener('mousedown',e=>{
    if(guide.locked)return;e.preventDefault();e.stopPropagation();
    selectGuide(guide);
    guideDragging={guide,startMouse:type==='h'?e.clientY:e.clientX,startPos:pos};
  });
  positionGuide(guide);return guide;
}

function toggleLockGuide(g){g.locked=!g.locked;g.container.classList.toggle('locked',g.locked);}

function positionGuide(g){
  const p=g.pos,HIT=HIT_THICK;
  if(g.type==='h'){
    g.line.style.cssText=`top:${p}px;left:0;right:0;`;
    g.hit.style.cssText=`top:${p-HIT}px;left:0;right:0;height:${HIT*2}px;`;
    g.label.style.cssText=`top:${p+3}px;left:6px;`;
  } else {
    g.line.style.cssText=`left:${p}px;top:0;bottom:0;`;
    g.hit.style.cssText=`left:${p-HIT}px;top:0;bottom:0;width:${HIT*2}px;`;
    g.label.style.cssText=`left:${p+3}px;top:4px;`;
  }
  g.label.textContent=Math.round(p)+'px';
  g.label.className='g-label'+(g.id===selectedGuide?.id?' selected':'');
  g.line.className=`g-line ${g.type}`+(g.id===selectedGuide?.id?' selected':'');
}

function selectGuide(g){selectedGuide=g;guides.forEach(positionGuide);}

function removeGuide(g){
  if(g.locked)return;
  g.container.remove();guides=guides.filter(x=>x.id!==g.id);
  if(selectedGuide?.id===g.id)selectedGuide=null;
}

function edgeIntent(e){
  const x=e.clientX,y=e.clientY;W=window.innerWidth;H=window.innerHeight;
  if(y<=EDGE_HIT||y>=H-EDGE_HIT)return{type:'h',pos:y};
  if(x<=EDGE_HIT||x>=W-EDGE_HIT)return{type:'v',pos:x};
  return null;
}

document.addEventListener('mousedown',e=>{
  if(e.target.classList.contains('g-hit'))return;
  const edge=edgeIntent(e);
  if(edge){e.preventDefault();const g=createGuide(edge.type,edge.pos);selectGuide(g);guideDragging={guide:g,startMouse:edge.type==='h'?e.clientY:e.clientX,startPos:edge.pos};return;}
  selectedGuide=null;guides.forEach(positionGuide);
});

window.addEventListener('mousemove',e=>{
  if(guideDragging){
    const{guide}=guideDragging;
    const raw=guide.type==='h'?e.clientY+window.pageYOffset:e.clientX;
    const max=guide.type==='h'?window.innerHeight+window.pageYOffset:window.innerWidth;
    guide.pos=Math.max(0,Math.min(max,raw));positionGuide(guide);return;
  }
  const edge=edgeIntent(e);
  if(edge){document.body.style.cursor=edge.type==='h'?'ns-resize':'ew-resize';return;}
  document.body.style.cursor='';
});

function toggleClearGuidesVisibility(){
  if(document.querySelectorAll('.g-hit').length){
    document.querySelector('.clear-guides')?.classList.remove('hidden');
  } else {
    document.querySelector('.clear-guides')?.classList.add('hidden');
  }
}

function repositionGHits(){
  const newW=window.innerWidth,newH=window.innerHeight;
  const diffW=(newW-W)/2;
  guides.forEach(g=>{
    if(g.type==='v')g.pos=Math.max(0,Math.min(newW,g.pos+diffW));
    positionGuide(g);
  });
  W=newW;H=newH;
}
window.onresize=repositionGHits;

window.addEventListener('mouseup',()=>{guideDragging=null;toggleClearGuidesVisibility();document.body.style.cursor='';});

document.addEventListener('keydown',e=>{
  if((e.key==='Delete'||e.key==='Backspace')&&selectedGuide){
    if(['INPUT','TEXTAREA'].includes(document.activeElement.tagName))return;
    removeGuide(selectedGuide);toggleClearGuidesVisibility();
  }
});

function deleteAllGuides(){[...guides].forEach(removeGuide);toggleClearGuidesVisibility();}
document.querySelectorAll('.clear-guides').forEach(el=>el.addEventListener('click',()=>deleteAllGuides()));