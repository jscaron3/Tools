const extractBtn = document.getElementById("extractBtn");
const svgInput = document.getElementById("svgInput");
const output = document.getElementById("path-output");
const count = document.getElementById("count");

extractBtn.addEventListener("click", () => {
	const svgCode = svgInput.value;

	if (!svgCode.trim()) {
		output.textContent = "Please paste SVG code.";
		count.textContent = "";
		return;
	}

	const parser = new DOMParser();
	const doc = parser.parseFromString(svgCode, "image/svg+xml");

	const parserError = doc.querySelector("parsererror");

	if (parserError) {
		output.textContent = "Invalid SVG code.";
		count.textContent = "";
		return;
	}

	const paths = [...doc.querySelectorAll("path")].map((path) => path.outerHTML);

	if (!paths.length) {
		output.textContent = "No <path> elements found.";
		count.textContent = "| 0 paths found";
		return;
	}

	output.textContent = paths.join("\n\n");
	count.textContent = `| ${paths.length} path${paths.length > 1 ? "s" : ""} found`;
});

document.addEventListener("DOMContentLoaded", (event) => {
	document.querySelectorAll(".buttons a").forEach((link) => {
		if (link.dataset.img) {
			link.style.setProperty("--img", `url(${link.dataset.img})`);
		}
	});
});



// document.getElementById('copy-paths').addEventListener('click', function() {
//       var out = document.getElementById('path-output');
//       out.select();
//       try { document.execCommand('copy'); } catch(e) {}
//       var ok = document.getElementById('copy-ok');
//       ok.style.display = 'inline-flex';
//       setTimeout(function() { ok.style.display = 'none'; }, 2000);
//     });


document.addEventListener('click', function (e) {
	const btn = e.target.closest('[data-copy]');
	if (!btn) return;

	const target = document.querySelector(btn.dataset.copy);
	if (!target) return;

	const text =
		target.value ??
		target.textContent ??
		target.innerText;
	
	if (!text.trim()) return;

	navigator.clipboard.writeText(text).then(() => {
		const ok = btn.dataset.copyMessage
			? document.querySelector(btn.dataset.copyMessage)
			: null;

		if (ok) {
			ok.style.display = 'inline-flex';
			setTimeout(() => {
				ok.style.display = 'none';
			}, 2000);
		}
	});
});
