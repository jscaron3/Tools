
const ALL='100,200,300,400,500,600,700,800,900,1000';
const RAW=`Inter:v100-900i
Roboto:v100-900i@wdth
Open Sans:v300-800i@wdth
Montserrat:v100-900i
Lato:s100,300,400,700,900i
Poppins:s*i
Roboto Condensed:v100-900i
Source Sans 3:v200-900i
Oswald:v200-700
Raleway:v100-900i
Noto Sans:v100-900i@wdth
Nunito:v200-1000i
Nunito Sans:v200-1000i
Ubuntu:s300,400,500,700i
Playfair Display:v400-900i
Merriweather:v300-900i
Rubik:v300-900i
PT Sans:s400,700i
Work Sans:v100-900i
Mulish:v200-1000i
Kanit:s*i
DM Sans:v100-1000i
Barlow:s*i
Fira Sans:s*i
Quicksand:v300-700
Manrope:v200-800
Karla:v200-800i
Libre Baskerville:v400-700i
Josefin Sans:v100-700i
Cabin:v400-700i@wdth
Heebo:v100-900
Urbanist:v100-900i
Outfit:v100-900
Lexend:v100-900
Plus Jakarta Sans:v200-800i
Space Grotesk:v300-700
Sora:v100-800
Figtree:v300-900i
Albert Sans:v100-900i
Bebas Neue:s400
Anton:s400
Archivo:v100-900i@wdth
IBM Plex Sans:v100-700i@wdth
IBM Plex Mono:s100,200,300,400,500,600,700i
JetBrains Mono:v100-800i
Fira Code:v300-700
Roboto Mono:v100-700i
Roboto Slab:v100-900
Source Serif 4:v200-900i
Lora:v400-700i
EB Garamond:v400-800i
Cormorant Garamond:v300-700i
Libre Franklin:v100-900i
Titillium Web:s200,300,400,600,700,900i
Arimo:v400-700i
Dosis:v200-800
Exo 2:v100-900i
Hind:s300,400,500,600,700
Bitter:v100-900i
Zilla Slab:s300,400,500,600,700i
Caveat:v400-700
Pacifico:s400
Dancing Script:v400-700
Lobster:s400
Abril Fatface:s400
Asap:v100-900i
Catamaran:v100-900
Red Hat Display:v300-900i
Red Hat Text:v300-700i
Epilogue:v100-900i
Syne:v400-800
Bricolage Grotesque:v200-800
Instrument Sans:v400-700i
Onest:v100-900
Geist:v100-900
Public Sans:v100-900i
Be Vietnam Pro:s*i
Prompt:s*i
Space Mono:s400,700i
Overpass:v100-900i
Spectral:s200,300,400,500,600,700,800i
Vollkorn:v400-900i
Fraunces:v100-900i
Jost:v100-900i
Cinzel:v400-900
Comfortaa:v300-700
Varela Round:s400`;
const FONTS=RAW.split('\n').map(l=>{
  const m=l.match(/^(.+?):([vs])([\d,\-*]+)(i?)(?:@(.+))?$/);
  const o={name:m[1],kind:m[2],it:!!m[4],axes:m[5]||''};
  if(m[2]==='v'){const [a,b]=m[3].split('-');o.min=+a;o.max=+b;o.wts=ALL.split(',').map(Number)}
  else o.wts=(m[3]==='*'?ALL:m[3]).split(',').map(Number);
  return o;
});
const WN={100:'Thin',200:'ExtraLight',300:'Light',400:'Regular',500:'Medium',600:'SemiBold',700:'Bold',800:'ExtraBold',900:'Black'};
const $=id=>document.getElementById(id);
let st={name:'Urbanist',kind:'v',known:true,avail:'both',min:100,max:900,axes:'',it:true,sw:new Set([400,700]),wts:ALL.split(',').map(Number)};

function pick(f){
  st.name=f.name;st.known=true;
  st.avail=f.kind==='v'?'both':'s';
  st.kind=f.kind;
  st.min=f.min||f.wts[0];st.max=f.max||f.wts[f.wts.length-1];
  st.axes=f.axes;st.it=f.it;st.wts=f.wts;
  st.sw=new Set(f.wts.includes(400)&&f.wts.includes(700)?[400,700]:[f.wts[0]]);
  if(f.kind==='v'){st.min=f.min;st.max=f.max}
  sync();render();
}
function pickCustom(name){
  st={name,kind:'v',known:false,avail:'both',min:100,max:900,axes:'',it:false,sw:new Set([400,700]),wts:ALL.split(',').map(Number)};
  sync();render();
}
function sync(){
  $('wmin').value=st.min;$('wmax').value=st.max;$('axes').value=st.axes;$('it').checked=st.it;
  $('it').disabled=false;
}
function list(){
  const q=$('q').value.trim().toLowerCase();
  const L=$('list');L.innerHTML='';
  const m=FONTS.filter(f=>f.name.toLowerCase().includes(q));
  m.forEach(f=>{
    const b=document.createElement('button');
    b.className=f.name===st.name?'on':'';
    b.innerHTML='<span></span><span class="tag"></span>';
    b.firstChild.textContent=f.name;b.lastChild.textContent=f.kind==='v'?'variable':'static';
    b.onclick=()=>pick(f);L.appendChild(b);
  });
  if(q&&!FONTS.some(f=>f.name.toLowerCase()===q)){
    const raw=$('q').value.trim();
    const b=document.createElement('button');
    b.innerHTML='<span></span><span class="tag">custom</span>';
    b.firstChild.textContent='Use “'+raw+'”';
    b.onclick=()=>pickCustom(raw.replace(/\b\w/g,c=>c.toUpperCase()));
    L.appendChild(b);
  }
}
function data(){
  st.min=+$('wmin').value||100;st.max=+$('wmax').value||900;
  st.axes=$('axes').value.replace(/\s/g,'');st.it=$('it').checked;
}
function css(){
  const {name}=st;const fam=name.replace(/\s+/g,'');
  const dir=($('dir').value.trim().replace(/\/+$/,'')||'fonts')+'/'+fam;
  const woff=$('woff').checked,disp=$('disp').value;
  const u=(f,e)=>`url('${dir}/${f}.${e}')`;
  const out=[],files=[];
  const axes=['wght',...st.axes.split(',').filter(a=>a&&a!=='wght')].sort().join(',');
  if(st.kind==='v'){
    (st.it?[false,true]:[false]).forEach(it=>{
      const f=`${fam}-${it?'Italic-':''}VariableFont_${axes}`;files.push(f+'.ttf');
      let s=`@font-face {\n    font-family: '${name}';\n    src:\n        ${u(f,'woff2')} format('woff2 supports variations'),\n        ${u(f,'woff2')} format('woff2-variations')`;
      if(woff)s+=`,\n        ${u(f,'woff')} format('woff')`;
      s+=`;\n    font-weight: ${st.min} ${st.max};\n`;
      if(axes.includes('wdth'))s+=`    font-stretch: 75% 100%;\n`;
      if(it)s+=`    font-style: italic;\n`;
      s+=`    font-display: ${disp};\n}`;out.push(s);
    });
  }else{
    [...st.sw].sort((a,b)=>a-b).forEach(w=>{
      (st.it?[false,true]:[false]).forEach(it=>{
        const n=WN[w]||'Regular';
        const f=`${fam}-${n==='Regular'?(it?'Italic':'Regular'):n+(it?'Italic':'')}`;files.push(f+'.ttf');
        let s=`@font-face {\n    font-family: '${name}';\n    src:\n        ${u(f,'woff2')} format('woff2')`;
        if(woff)s+=`,\n        ${u(f,'woff')} format('woff')`;
        s+=`;\n    font-weight: ${w};\n`;
        if(it)s+=`    font-style: italic;\n`;
        s+=`    font-display: ${disp};\n}`;out.push(s);
      });
    });
  }
  return {code:out.join('\n\n'),files};
}
function preview(){
  const n=st.name,enc=encodeURIComponent(n).replace(/%20/g,'+');
  let spec;
  if(st.kind==='v'){const r=`${st.min}..${st.max}`;spec=st.it?`ital,wght@0,${r};1,${r}`:`wght@${r}`}
  else{const w=[...st.sw].sort((a,b)=>a-b);spec=st.it?'ital,wght@'+w.map(x=>'0,'+x).concat(w.map(x=>'1,'+x)).join(';'):'wght@'+w.join(';')}
  let l=$('pvlink');
  if(!l){l=document.createElement('link');l.id='pvlink';l.rel='stylesheet';document.head.appendChild(l)}
  const href=`https://fonts.googleapis.com/css2?family=${enc}:${spec}&display=swap`;
  if(l.getAttribute('href')!==href)l.setAttribute('href',href);
  const p=$('pv');p.style.fontFamily=`'${n}',sans-serif`;p.textContent=$('sample').value||n;
  const r=$('wr');
  if(st.kind==='v'){r.min=st.min;r.max=st.max;r.step=1}else{r.min=100;r.max=900;r.step=100}
  let v=+r.value||400;v=Math.min(Math.max(v,+r.min),+r.max);r.value=v;
  p.style.fontWeight=v;$('wl').textContent='Preview weight: '+v;
}
function render(){
  data();list();
  const v=st.kind==='v';
  $('mV').className=v?'on':'';$('mS').className=v?'':'on';
  $('mV').disabled=(st.known&&st.avail==='s');
  $('optV').style.display=v?'':'none';$('optS').style.display=v?'none':'';
  $('hint').textContent=(st.known&&st.avail==='s')?'No variable version on Google Fonts.':(st.known?'':'Custom name: check the type and weights on Google Fonts.');
  const w=$('wts');w.innerHTML='';
  st.wts.forEach(x=>{
    const lb=document.createElement('label');
    const c=document.createElement('input');c.type='checkbox';c.checked=st.sw.has(x);
    c.onchange=()=>{c.checked?st.sw.add(x):st.sw.delete(x);render()};
    lb.append(c,String(x));w.appendChild(lb);
  });
  const enc=encodeURIComponent(st.name);
  $('dl').href='https://fonts.google.com/download?family='+enc;
  $('gf').href='https://fonts.google.com/specimen/'+enc.replace(/%20/g,'+');
  const r=css();
  $('out').textContent=r.code||'/* Select at least one weight */';
  $('files').innerHTML='Convert these from the zip: ';
  r.files.forEach((f,i)=>{if(i)$('files').append(', ');const c=document.createElement('code');c.textContent=f;$('files').append(c)});
  preview();
}
$('q').oninput=list;
['wmin','wmax','axes','it','woff','dir','disp','sample'].forEach(id=>$(id).addEventListener('input',render));
$('wr').oninput=()=>{$('pv').style.fontWeight=$('wr').value;$('wl').textContent='Preview weight: '+$('wr').value};
$('mV').onclick=()=>{st.kind='v';render()};
$('mS').onclick=()=>{st.kind='s';render()};
$('cp').onclick=async()=>{
  const t=$('out').textContent;
  try{await navigator.clipboard.writeText(t)}catch(e){
    const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(_){}a.remove();
  }
  $('cp').textContent='Copied';setTimeout(()=>$('cp').textContent='Copy CSS',1200);
};
pick(FONTS.find(f=>f.name==='Urbanist'));
