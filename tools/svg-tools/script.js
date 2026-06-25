document.addEventListener("DOMContentLoaded", (event) => {
	document.querySelectorAll(".buttons a").forEach((link) => {
		if (link.dataset.img) {
			// link.style.setProperty("--img", `url(${link.dataset.img})`);

			const preview = document.createElement('iframe');
			preview.src = link.dataset.img;
			preview.title = `${link.textContent} preview`;
			preview.loading = 'lazy';
			preview.tabIndex = -1;
			preview.setAttribute('aria-hidden', 'true');
			link.appendChild(preview);
		}

	});
});
