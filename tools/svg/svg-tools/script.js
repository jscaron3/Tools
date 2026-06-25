
// function buildLinks() {
// 	document.querySelectorAll(".buttons a").forEach((link) => {
// 		// if (link.dataset.img) {
// 		if (link.dataset.img) {
// 			// link.style.setProperty("--img", `url(${link.dataset.img})`);

// 			const preview = document.createElement('iframe');
// 			preview.src = link.dataset.img;
// 			preview.title = `${link.textContent} preview`;
// 			preview.loading = 'lazy';
// 			preview.tabIndex = -1;
// 			preview.setAttribute('aria-hidden', 'true');
// 			link.appendChild(preview);
// 		}

// 	});
// } 



function buildLinks() {
	document.querySelectorAll(".buttons a").forEach((link) => {
		// if (link.dataset.img) {
		if (link.href) {
			// link.style.setProperty("--img", `url(${link.dataset.img})`);

			const preview = document.createElement('iframe');
			preview.src = link.href;
			preview.title = `${link.textContent} preview`;
			preview.loading = 'lazy';
			preview.tabIndex = -1;
			preview.setAttribute('aria-hidden', 'true');
			link.appendChild(preview);
		}

	});
} 

buildLinks();