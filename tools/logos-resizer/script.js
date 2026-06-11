let CANVAS_W = 400;
let CANVAS_H = 300;
let items = [];

const dlAll = document.getElementById('download-all');
dlAll.addEventListener('click', () => downloadAll());

const applySize = document.getElementById('apply-size');
applySize.addEventListener('click', () => applyCanvasSize());

const upload = document.getElementById('upload');
const dropZone = document.getElementById('dropZone');

function handleFiles(fileList) {
    [...fileList].forEach((file) => {
        const img = new Image();

        img.onload = () => {
            const item = {
                fileName: file.name.replace(/\.[^/.]+$/, ''),
                ext: file.name.split('.').pop().toLowerCase(),
                img,

                ogWidth: img.naturalWidth,
                ogHeight: img.naturalHeight,

                scale: 100,
                x: 50,
                y: 50,
                rotation: 0, // degrees (0, 90, 180, 270)

                canvas: null,
                ctx: null,
                card: null
            };

            items.push(item);
            createCard(item);
        };

        img.src = URL.createObjectURL(file);
    });
}

// native input still works
upload.onchange = (e) => {
    handleFiles(e.target.files);
    upload.value = '';
};

document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

document.addEventListener('drop', (e) => {
    e.preventDefault();
});

// click zone triggers input
dropZone.addEventListener('click', () => upload.click());

// drag events
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
});

function createCard(item) {
    item.allowUpscale = false;

    const card = document.createElement('div');
    card.className = 'card';

    let ogW = item.ogWidth ? `<span class="file-width">${item.ogWidth}</span>` : '';
    let ogH = item.ogHeight ? `<span class="file-height">${item.ogHeight}</span>` : '';
    let ogSize = '';

    if (ogW && ogH) {
        ogSize = ' - <span class="file-sizes">' + ogW + ' x ' + ogH + '</span>';
    }

    let rendered_sizes =
        '<div class="rendered-sizes">Rendered: <span class="rendered-w"></span> x <span class="rendered-h"></span></div>';

    card.innerHTML = `
        <div class="card-top">
            <div class="file-meta">
                <div class="filename"><span contenteditable="true">${item.fileName}</span></div>
                <div class="file-infos"><div class="filetype">${item.ext}</div>${ogSize}</div>
								${rendered_sizes}			
            </div>

            <div style="display:flex;gap:6px;">
					<span class="download-one" title="Download"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g stroke-linejoin="round" stroke-linecap="round" stroke-width="2" fill="none" stroke="#000000"><path d="M12 15V3"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><path d="m7 10 5 5 5-5"></path></g></svg></span>
					<span class="reset-size" title="Reset size"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M13 3a9 9 0 0 0-9 9H1l4 3.99L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.25 2.52.77-1.28-3.52-2.09V8H12z" fill="#000000"></path></g></svg></span>
					<span class="delete-btn" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none"><path d="M14.7404 9L14.3942 18M9.60577 18L9.25962 9M19.2276 5.79057C19.5696 5.84221 19.9104 5.89747 20.25 5.95629M19.2276 5.79057L18.1598 19.6726C18.0696 20.8448 17.0921 21.75 15.9164 21.75H8.08357C6.90786 21.75 5.93037 20.8448 5.8402 19.6726L4.77235 5.79057M19.2276 5.79057C18.0812 5.61744 16.9215 5.48485 15.75 5.39432M3.75 5.95629C4.08957 5.89747 4.43037 5.84221 4.77235 5.79057M4.77235 5.79057C5.91878 5.61744 7.07849 5.48485 8.25 5.39432M15.75 5.39432V4.47819C15.75 3.29882 14.8393 2.31423 13.6606 2.27652C13.1092 2.25889 12.5556 2.25 12 2.25C11.4444 2.25 10.8908 2.25889 10.3394 2.27652C9.16065 2.31423 8.25 3.29882 8.25 4.47819V5.39432M15.75 5.39432C14.5126 5.2987 13.262 5.25 12 5.25C10.738 5.25 9.48744 5.2987 8.25 5.39432" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g></svg></span>
            </div>
        </div>

        <canvas></canvas>

        <div class="controls">
				
				<div class="scale-dragger" data-scale-drag>
						<div class="knob"></div>
				</div>

            <label for="x-pos">X</label>
            <input id="x-pos" type="range" min="-50" max="150" value="50" data-key="x">

            <label for="y-pos">Y</label>
            <input id="y-pos" type="range" min="-50" max="150" value="50" data-key="y">

            <label for="allowUpscale">
                <input id="allowUpscale" type="checkbox" data-key="allowUpscale">
                Allow Upscale
            </label>
						
						<button type="button" data-fit="contain">Contain</button>
						<button type="button" data-fit="cover">Cover</button>
						
						<span class="rotate-btn" title="Rotate"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#000" d="M17.65 6.35A7.96 7.96 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"/></svg></span>
        </div>
    `;

    const canvas = card.querySelector('canvas');
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    item.canvas = canvas;
    item.ctx = canvas.getContext('2d');
    item.card = card;

    card.querySelector('.controls').addEventListener('input', (e) => {
        const key = e.target.dataset.key;
        if (!key) return;

        if (e.target.type === 'checkbox') {
            item[key] = e.target.checked;
        } else {
            item[key] = parseInt(e.target.value);
        }

        draw(item);
    });

    item.scaleValue = 0;
    item.baseScale = 0;
    item.dragOffset = 0;
    item.fitMode = 'none'; // none | contain | cover
    item.fitBaseScale = null;

    const drag = card.querySelector('[data-scale-drag]');
    const knob = drag.querySelector('.knob');

    let dragging = false;
    let startX = 0;

    function updateKnob() {
        const width = drag.offsetWidth;
        const offset = item.dragOffset;
        const percent = 0.5 + offset / width;

        knob.style.left = Math.max(Math.min(percent * 100, 100), 0) + '%';
    }

    drag.addEventListener('mousedown', (e) => {
        dragging = true;
        startX = e.clientX;
    });

    // 	OG to keep
    /*window.addEventListener("mousemove", (e) => {
		if (!dragging) return;

		const dx = e.clientX - startX;
		startX = e.clientX;

		item.dragOffset += dx;
		
		console.log(item.dragOffset);

		updateKnob();
		draw(item);
	});*/

    // exponential curve
    window.addEventListener('mousemove', (e) => {
        if (!dragging) return;

        const dx = e.clientX - startX;
        startX = e.clientX;

        item.dragOffset += dx;

        if (item.dragOffset > 200) {
            const excess = item.dragOffset - 200;
            item.dragOffset = 200 + Math.sign(excess) * Math.pow(Math.abs(excess), 1.00001);
        } else if (item.dragOffset < -200) {
            const excess = item.dragOffset + 200;
            item.dragOffset = -200 + Math.sign(excess) * Math.pow(Math.abs(excess), 1.00001);
        }

        console.log(item.dragOffset);

        updateKnob();
        draw(item);
    });

    window.addEventListener('mouseup', () => {
        dragging = false;

        item.baseScale += item.dragOffset;

        // if (!item.allowUpscale) {
        // 	item.baseScale = Math.min(item.baseScale, 1);
        // }

        item.dragOffset = 0;

        console.log(item);

        updateKnob();
    });

    card.querySelectorAll('[data-fit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const imgW = item.img.width;
            const imgH = item.img.height;

            let fitScale =
                btn.dataset.fit === 'contain'
                    ? Math.min(CANVAS_W / imgW, CANVAS_H / imgH)
                    : Math.max(CANVAS_W / imgW, CANVAS_H / imgH);

            // store absolute base
            item.fitBaseScale = fitScale;

            // reset interaction offsets
            // item.baseScale = 0;
            item.baseScale = 1;
            item.dragOffset = 0;

            draw(item);
        });
    });

    card.querySelector('.rotate-btn').onclick = () => {
        item.rotation = (item.rotation + 90) % 360;
        draw(item);
    };

    card.querySelector('.reset-size').onclick = () => {
        console.log(item);
        item.baseScale = 0;
        item.scaleValue = 0;
        item.x = 50;
        item.y = 50;
        item.fitBaseScale = null;
        item.baseScale = 0;
        item.dragOffset = 0;

        // item.fitMode = "none";

        const inputs = card.querySelectorAll('[data-key]');
        inputs.forEach((i) => {
            if (i.type === 'range') i.value = 50;
            if (i.type === 'checkbox') i.checked = false;
        });

        draw(item);
    };

    card.querySelector('.delete-btn').onclick = () => removeItem(item);
    card.querySelector('.download-one').onclick = () => downloadOne(item);

    grid.appendChild(card);

    draw(item);
}

function resetSize(item, card) {
    console.log(item, card);
    item.scaleValue = 0;
    item.x = 50;
    item.y = 50;
    item.fitBaseScale = null;
    item.baseScale = 0;
    item.dragOffset = 0;

    console.log(item);

    const inputs = card.querySelectorAll('[data-key]');
    inputs.forEach((i) => {
        if (i.type === 'range') i.value = 0;
        if (i.type === 'checkbox') i.checked = false;
    });

    draw(item);
}

function removeItem(item) {
    items = items.filter((x) => x !== item);
    item.card.remove();
}

function applyCanvasSize() {
    CANVAS_W = parseInt(cw.value) || 400;
    CANVAS_H = parseInt(ch.value) || 300;

    items.forEach((item) => {
        item.canvas.width = CANVAS_W;
        item.canvas.height = CANVAS_H;
        draw(item);
    });
}

async function draw(item) {
    const ctx = item.ctx;
    const canvas = item.canvas;

    // ctx.clearRect(0,0,CANVAS_W,CANVAS_H);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    let bgColor = document.querySelector('input[name="bg-color"]:checked').value;
    ctx.fillStyle = bgColor === 'transparent' ? 'transparent' : bgColor;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const imgW = item.img.width;
    const imgH = item.img.height;

    // ----------------

    // 1. determine base scale
    let base = item.fitBaseScale !== null ? item.fitBaseScale : 1;

    console.log(base);

    // 2. apply interactive delta on top of base
    let interactive = item.baseScale + item.dragOffset;

    // convert interactive into multiplier around base

    // let base = 1;

    let scale;

    if (interactive >= 0) {
        // scale = base * (1 + interactive / 500);
        scale = Math.min(3, base * (1 + interactive / CANVAS_H));
    } else {
        scale = Math.max(0.01, base * (1 + interactive / CANVAS_W));
    }

    let ogWidth = item.ogWidth;
    let ogHeight = item.ogHeight;

    let maxReached = false;

    if (!item.allowUpscale && ['png', 'jpg', 'jpeg'].includes(item.ext)) {
        if (scale > 1) {
            scale = 1;
            maxReached = true;
        }
    }
    const w = item.img.width * scale;
    const h = item.img.height * scale;

    // rendered_w =

    let rendered_w = item.card.querySelector('.rendered-w');
    let rendered_h = item.card.querySelector('.rendered-h');

    rendered_w.textContent = parseFloat(w)
        .toFixed(2)
        .replace(/\.?0+$/, '');
    rendered_h.textContent = parseFloat(h)
        .toFixed(2)
        .replace(/\.?0+$/, '');

    // V1
    // const cx = CANVAS_W / 2 + item.x;
    // const cy = CANVAS_H / 2 + item.y;

    // let cx = CANVAS_W / 2 + ((item.x/ 100) * w );
    // let cy = CANVAS_H / 2 + ((item.y/ 100) * h );

    // let overflowX = Math.max(0, w - CANVAS_W);
    // let overflowY = Math.max(0, h - CANVAS_H);

    let overflowX = w - CANVAS_W;
    let overflowY = h - CANVAS_H;

    let px = Math.min(150, Math.max(-50, item.x)) / 100;
    let py = Math.min(150, Math.max(-50, item.y)) / 100;

    // let px = Math.min(100, Math.max(0, item.x)) / 100;
    // let py = Math.min(100, Math.max(0, item.y)) / 100;

    // let cx = -(overflowX * px);
    // let cy = -(overflowY * py);

    let cx, cy;
    // cx = -(overflowX * px);
    // cy = -(overflowY * py);

    if (CANVAS_W >= imgW) {
        // cx = (CANVAS_W - w) / 2;
        // cx = (overflowX * px);
        cx = (CANVAS_W - w) * px;
    } else {
        cx = -(overflowX * px);
    }

    if (CANVAS_H >= imgH) {
        // cy = (CANVAS_H - h) / 2;
        // cy = (overflowY * py);
        cy = (CANVAS_H - h) * py;
    } else {
        cy = -(overflowY * py);
    }

    console.log(cx, cy);

    const bitmap = await createImageBitmap(item.img, {
        resizeWidth: w,
        resizeHeight: h,
        resizeQuality: 'high' // Uses a high-quality (often bicubic) algorithm
    });

    // V3
    ctx.save();

    const centerX = cx + w / 2;
    const centerY = cy + h / 2;

    ctx.translate(centerX, centerY);
    ctx.rotate((item.rotation * Math.PI) / 180);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(item.img, -w / 2, -h / 2, w, h); // .imageSmoothingEnabled
    // ctx.drawImage(bitmap, -w / 2, -h / 2); // KEEP for bitmap image smoothing

    ctx.restore();

    // V2
    // ctx.drawImage(item.img, cx, cy, w, h);

    // V1
    // ctx.drawImage(item.img, cx - w / 2, cy - h / 2, w, h);

    canvas.style.border = maxReached ? '1px solid red' : '1px solid #ccc';
}

function getExportData(item) {
    const selected = exportFormat.value;

    if (selected === 'png') {
        return { mime: 'image/png', ext: 'png' };
    }

    if (selected === 'jpeg') {
        return { mime: 'image/jpeg', ext: 'jpg' };
    }

    if (['jpg', 'jpeg'].includes(item.ext)) {
        return { mime: 'image/jpeg', ext: 'jpg' };
    }

    return { mime: 'image/png', ext: 'png' };
}

// V2

function getExportCanvas(item, type) {
    if (type.mime !== 'image/jpeg' && type.mime !== 'image/png') {
        return item.canvas;
    }

    const temp = document.createElement('canvas');
    temp.width = CANVAS_W;
    temp.height = CANVAS_H;

    const tctx = temp.getContext('2d');

    // Test
    // tctx.imageSmoothingEnabled = true; // false = nearest-neighbor (pixelated)
    // tctx.imageSmoothingQuality = "high"; // "low" | "medium" | "high"

    let bgColor = document.querySelector('input[name="bg-color"]:checked').value;

    // change background here
    if (type.mime == 'image/jpeg' && bgColor == 'transparent') {
        tctx.fillStyle = '#ffffff';
    } else {
        tctx.fillStyle = bgColor;
    }

    tctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    tctx.drawImage(item.canvas, 0, 0);

    return temp;
}

async function downloadOne(item) {
    await draw(item);

    const type = getExportData(item);
    const exportCanvas = getExportCanvas(item, type);
    const name = item.card.querySelector('.filename').textContent || item.fileName;
    let name_output = name != item.fileName ? name : item.fileName;
    name_output = name_output.trim().replaceAll(' ', '-');

    exportCanvas.toBlob(
        (blob) => {
            saveAs(blob, name_output + '.' + type.ext);
        },
        type.mime,
        0.95
    );
}

async function downloadAll() {
    const zip = new JSZip();

    items.forEach(async (item) => {
        await draw(item);

        const type = getExportData(item);
        const exportCanvas = getExportCanvas(item, type);

        const base64 = exportCanvas.toDataURL(type.mime, 0.95).split(',')[1];

        const name = item.card.querySelector('.filename').textContent || item.fileName;
        let name_output = name != item.fileName ? name : item.fileName;
        name_output = name_output.trim().replaceAll(' ', '-');

        zip.file(name_output + '.' + type.ext, base64, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, 'logos.zip');
}

function updateAllCanvasBackground() {
    items.forEach((item) => draw(item));
}

document.querySelectorAll('input[name="bg-color"]').forEach((el) => {
    el.addEventListener('change', () => {
        // let bgColor = document.querySelector('input[name="bg-color"]:checked').value;
        updateAllCanvasBackground();
    });
});

const picker = document.querySelector('.custom-picker .color-input');
const pickerRadio = document.querySelector('.custom-picker input[type="radio"]');
const pickerPreview = document.querySelector('.picker');

picker.addEventListener('input', (e) => {
    const color = e.target.value;
    pickerPreview.style.background = color;
    pickerRadio.value = color;
    pickerRadio.checked = true;

    updateAllCanvasBackground();
});
