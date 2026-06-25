paper.setup(document.createElement("canvas"));

const input = document.getElementById("input");

const topEl = document.getElementById("top");
const rightEl = document.getElementById("right");
const bottomEl = document.getElementById("bottom");
const leftEl = document.getElementById("left");

const topInput = document.getElementById("pos-top");
const rightInput = document.getElementById("pos-right");
const bottomInput = document.getElementById("pos-bottom");
const leftInput = document.getElementById("pos-left");

const wEl = document.getElementById("w");
const hEl = document.getElementById("h");

const svg = document.getElementById("svg");
const content = document.getElementById("content");
const cropBox = document.getElementById("cropBox");
const clipRect = document.getElementById("clipRect");

let ogW = 400;
let ogH = 400;

// const handleDrag = document.getElementById("handleDrag");
const dragBox = document.getElementById("dragBox");

const handleTop = document.getElementById("handleTop");
const handleRight = document.getElementById("handleRight");
const handleBottom = document.getElementById("handleBottom");
const handleLeft = document.getElementById("handleLeft");

let state = { left: 0, top: 0, right: 100, bottom: 100 };
let currentPath = "";
let dragging = false;
let resizeMode = null;
let inputMode = null;
let dragOffset = { x: 0, y: 0 };

/* ---------------- PARSE ---------------- */
function parseSVG(text) {
  const doc = new DOMParser().parseFromString(text, "image/svg+xml");

  const svgEl = doc.querySelector("svg");
  const path = doc.querySelector("path");

  const vb = svgEl?.getAttribute("viewBox") || "0 0 400 400";
  svg.setAttribute("viewBox", vb);

  const [, , w, h] = vb.split(" ").map(Number);

  state = { left: 0, top: 0, right: w, bottom: h };

  topEl.max = bottomEl.max = h;
  leftEl.max = rightEl.max = w;

  topEl.value = 0;
  leftEl.value = 0;
  rightEl.value = w;
  bottomEl.value = h;
	
	// topInput.value = 0;
	// leftInput.value = 0;
	// rightInput.value = w / ogW;
	// bottomInput.value = h / ogH;
	

  syncUI();
  return path?.getAttribute("d") || "";
}

/* ---------------- UI ---------------- */
function syncUI() {
  wEl.value = state.right - state.left;
  hEl.value = state.bottom - state.top;
}

/* ---------------- HANDLE POSITIONS ---------------- */
function updateHandles() {
  const x = state.left, y = state.top;
  const w = state.right - state.left;
  const h = state.bottom - state.top;

  const size = 8;

  /*handleTop.setAttribute("x", x + w / 2 - size / 2);
  handleTop.setAttribute("y", y - size / 2);

  handleRight.setAttribute("x", x + w - size / 2);
  handleRight.setAttribute("y", y + h / 2 - size / 2);

  handleBottom.setAttribute("x", x + w / 2 - size / 2);
  handleBottom.setAttribute("y", y + h - size / 2);

  handleLeft.setAttribute("x", x - size / 2);
  handleLeft.setAttribute("y", y + h / 2 - size / 2);*/
	
	
	
	handleTop.setAttribute("x", x + w / 2 - size / 2);
  handleTop.setAttribute("y", y - (size / 2) - 1);

  handleRight.setAttribute("x", x + w - (size / 2) - 1);
  handleRight.setAttribute("y", y + h / 2 - size / 2);

  handleBottom.setAttribute("x", x + w / 2 - size / 2);
  handleBottom.setAttribute("y", y + h - (size / 2) - 1);

  handleLeft.setAttribute("x", x - (size / 2) - 1) ;
  handleLeft.setAttribute("y", y + h / 2 - size / 2);
	
	// handleDrag.setAttribute("x", x + w - 20 / 2);
	// handleDrag.setAttribute("y", y - 20 / 2);
}

/* ---------------- PAPER CROP ---------------- */
function generateCroppedPath() {
  paper.project.clear();

  const rect = new paper.Path.Rectangle(
    new paper.Point(state.left, state.top),
    new paper.Point(state.right, state.bottom)
  );

  const imported = new paper.Path(currentPath);

  const result = imported.intersect(rect);

  if (!result) return "";

  if (result instanceof paper.CompoundPath) {
    return result.children.map(p => p.pathData).join(" ");
  }

  return result.pathData;
}

/* ---------------- UPDATE ---------------- */
function updateCrop() {
  const x = state.left;
  const y = state.top;
  const w = state.right - state.left;
  const h = state.bottom - state.top;

  cropBox.setAttribute("x", x);
  cropBox.setAttribute("y", y);
  cropBox.setAttribute("width", w);
  cropBox.setAttribute("height", h);

	dragBox.setAttribute("x", x);
  dragBox.setAttribute("y", y);
  dragBox.setAttribute("width", w);
  dragBox.setAttribute("height", h);
	
  clipRect.setAttribute("x", x);
  clipRect.setAttribute("y", y);
  clipRect.setAttribute("width", w);
  clipRect.setAttribute("height", h);

	// topEl.value = state.top;
	// bottomEl.value = state.bottom;
	// leftEl.value = state.left;
	// rightEl.value = state.right;
	
	
	// console.log(state.top, state.bottom, state.left, state.right);
	topInput.value = (state.top / ogH) * 100;
	bottomInput.value = (state.bottom / ogH) * 100;
	leftInput.value = (state.left / ogW) * 100;
	rightInput.value = (state.right / ogW) * 100;
	
	

  syncUI();
  updateHandles();

  document.getElementById("output").value = generateCroppedPath();
}

/* ---------------- RENDER ---------------- */
function render() {
  currentPath = parseSVG(input.value);
  content.innerHTML = `<path d="${currentPath}" fill="black"/>`;
	
// 	Test
	const vb = svg.viewBox.baseVal;
	ogW = vb.width;
	ogH = vb.height;
	// 	END Test
	
  updateCrop();
}

/* ---------------- SLIDERS ---------------- */
[topEl, rightEl, bottomEl, leftEl].forEach(el => {
  el.addEventListener("input", () => {
    state.top = +topEl.value;
    state.right = +rightEl.value;
    state.bottom = +bottomEl.value;
    state.left = +leftEl.value;
    updateCrop();
  });
});

/* ---------------- DRAG MOVE ---------------- */
function getMousePos(evt) {
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(svg.getScreenCTM().inverse());
}

/*cropBox.addEventListener("mousedown", e => {
  dragging = true;
  const p = getMousePos(e);

  dragOffset.x = p.x - state.left;
  dragOffset.y = p.y - state.top;
});*/

dragBox.addEventListener("mousedown", e => {
	document.body.classList.add('dragging');
  dragging = true;
  const p = getMousePos(e);

  dragOffset.x = p.x - state.left;
  dragOffset.y = p.y - state.top;
});


/*handleDrag.addEventListener("mousedown", e => {
	dragging = true;
  const p = getMousePos(e);

  dragOffset.x = p.x - state.left;
  dragOffset.y = p.y - state.top;
});*/



window.addEventListener("mousemove", e => {
  if (!dragging || resizeMode) return;

  const p = getMousePos(e);

  const w = state.right - state.left;
  const h = state.bottom - state.top;

  let nl = p.x - dragOffset.x;
  let nt = p.y - dragOffset.y;

  const vb = svg.viewBox.baseVal;

  nl = Math.max(0, Math.min(nl, vb.width - w));
  nt = Math.max(0, Math.min(nt, vb.height - h));

  state.left = nl;
  state.top = nt;
  state.right = nl + w;
  state.bottom = nt + h;

  updateCrop();
});

/* ---------------- RESIZE ---------------- */
[handleTop, handleRight, handleBottom, handleLeft].forEach(el => {
  el.addEventListener("mousedown", e => {
    resizeMode = el.id.replace("handle", "").toLowerCase();
		document.body.classList.add('resizing');
    e.stopPropagation();
  });
});



[topInput, bottomInput, leftInput, rightInput].forEach(el => {
  el.addEventListener("input", e => {
		if(!resizeMode && !dragging) {
			
			
    	inputMode = el.id.replace("pos-", "").toLowerCase();
			let new_value = parseInt(el.value) ? parseInt(el.value) : 0;
			if (inputMode === "left") state.left = (new_value / 100) * ogW;
			if (inputMode === "right") state.right = (new_value / 100) * ogW;
			if (inputMode === "top") state.top = (new_value / 100) * ogH;
			if (inputMode === "bottom") state.bottom = (new_value / 100) * ogH;
			
			
			const vb = svg.viewBox.baseVal;

			state.left = Math.max(0, state.left);
			state.top = Math.max(0, state.top);
			state.right = Math.min(vb.width, state.right);
			state.bottom = Math.min(vb.height, state.bottom);
			
			updateCrop();
			// console.log();
		}
		
		inputMode = null;
    e.stopPropagation();
  });
});

window.addEventListener("mousemove", e => {
  if (!resizeMode) return;

  const p = getMousePos(e);
  const min = 5;

  if (resizeMode === "left") state.left = Math.min(p.x, state.right - min);
  if (resizeMode === "right") state.right = Math.max(p.x, state.left + min);
  if (resizeMode === "top") state.top = Math.min(p.y, state.bottom - min);
  if (resizeMode === "bottom") state.bottom = Math.max(p.y, state.top + min);

  const vb = svg.viewBox.baseVal;

  state.left = Math.max(0, state.left);
  state.top = Math.max(0, state.top);
  state.right = Math.min(vb.width, state.right);
  state.bottom = Math.min(vb.height, state.bottom);

  updateCrop();
});


window.addEventListener("mouseup", () => {
  dragging = false;
  resizeMode = null;
	
	// document.body.classList.remove('resizing');
	document.body.classList.remove('dragging', 'resizing');
});

/* ---------------- RESET ---------------- */
function resetCrop() {
  const vb = svg.viewBox.baseVal;

  state = { left: 0, top: 0, right: vb.width, bottom: vb.height };
  updateCrop();
}

/* ---------------- INIT ---------------- */
input.addEventListener("input", render);

input.value = `<svg viewBox="0 0 400 400">
<path d="M0 0 L400 0 L400 400 L0 400 Z"/>
</svg>`;

render();

/* ---------------- COPY ---------------- */

function copyPathCoordinates() {
  const out = document.getElementById("output");
  navigator.clipboard.writeText(out.value || "");
}

function copyPath() {
  const out = document.getElementById("output");
	if(out.value) {
  	navigator.clipboard.writeText('<path d="'+out.value+'"/>' || "");
	}
}

