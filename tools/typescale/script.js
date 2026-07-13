// import { Pane } from 'https://esm.sh/tweakpane';
// import { Pane } from "https://esm.sh/tweakpane@4.0.4";
import { Pane } from "https://esm.sh/tweakpane@4.0.4";



// import {
// 	Notif,
// 	Notif_link
// } from "https://codepen.io/jean-samuel-caron/pen/oNrbMMK.js";

jQuery(document).ready(function () {
	
	
	
	
	
	
	
	// Type scale
	
	
	
	function updateFontSize() {
		jQuery('h1,h2,h3,h4,h5,h6,p').each(function(){
			var size = jQuery(this).css('font-size');
			jQuery(this).attr('data-size', size);
		});
	}

	jQuery(window).on('load resize', updateFontSize);


	function onInput(element) {
		var newText = element.currentTarget.value;
		jQuery('.type-scale :is(h1,h2,h3,h4,h5,h6)').text(newText);
	}

	jQuery('#replace-titles').on('input', onInput);
	
	
	
	
	
	
// 	Sidebar
	const sidebar = document.getElementById('sidebar');
	const openSidebar = document.getElementById('open-sidebar');
	openSidebar.addEventListener('click', async () => {
	
		if (sidebar.style.display === "none") {
			sidebar.style.display = "block";
		} else {
			sidebar.style.display = "none";
		}
	
	});
	
	// 	END Sidebar
	
	
	// Create layouts
	
	const container = document.querySelector('.sections');

	const configs = [
		{ key: '1', cols: 1 },
		{ key: '2', cols: 2 },
		{ key: '3', cols: 3 },
		{ key: '4', cols: 4 },
		{ key: '5', cols: 5 },
		{ key: '2-1-1', cols: [2,1,1] }
	];

	const wrappers = [
		{ title: c => `${c} column${c > 1 ? 's' : ''} | 90%`, fw: true, noPad: false },
		{ title: c => `${c} column${c > 1 ? 's' : ''} | max-width 1600px - 90%`, fw: false, noPad: true },
		{ title: c => `${c} column${c > 1 ? 's' : ''} with padding | max-width 1600px - 90%`, fw: false, noPad: false }
	];

	const contentHTML = `
		<h1>Test h1 size</h1>
		<h2>Test h2 size</h2>
		<h3>Test h3 size</h3>
		<h4>Test h4 size</h4>
		<h5>Test h5 size</h5>
		<h6>Test h6 size</h6>
		<p>Test p size</p>
	`;

	configs.forEach(cfg => {
		const section = document.createElement('div');
		section.className = 'section';
		section.dataset.columns = cfg.key;

		const colCount = Array.isArray(cfg.cols) ? cfg.cols.length : cfg.cols;

		wrappers.forEach(w => {
			const wrapper = document.createElement('div');
			wrapper.className = 'wrapper';

			const title = document.createElement('div');
			title.className = 'title';
			title.textContent = w.title(colCount);

			const columns = document.createElement('div');
			columns.className = 'columns' + (w.fw ? ' fw' : '');

			for (let i = 0; i < colCount; i++) {
				const col = document.createElement('div');
				col.className = 'column' + (w.noPad ? ' no-pad' : '');

				// only fill first column (like your HTML)
				if (i === 0 || cfg.key === '2-1-1' && i < 2) {
					col.innerHTML = contentHTML;
				}

				columns.appendChild(col);
			}

			wrapper.appendChild(title);
			wrapper.appendChild(columns);
			section.appendChild(wrapper);
		});

		container.appendChild(section);
	});
	
	
	
	
	
	
	
	
	

	
	
	
	const baseInput = document.getElementById('base');
	const minInput = document.getElementById('ratio'); // rename later if needed
	const curveInput = document.getElementById('curve'); // NEW INPUT
	const output = document.getElementById('output');
	const inputCSS = document.getElementById('input-css');
	const liveCSS = document.getElementById('live-css');
	
 /*
 --fs-h1-main: clamp(33px, min(10cqi, 27.333px + 1.4167vw), 50px);
    --fs-h2-main: clamp(30px, min(9cqi, 26px + 1vw), 42px);
    --fs-h3-main: clamp(26px, min(8.5cqi, 23px + 0.75vw), 35px);
    --fs-h4-main: clamp(23px, min(7.75cqi, 20.667px + 0.5833vw), 30px);
    --fs-h5-main: clamp(20px, min(7.25cqi, 18.667px + 0.3333vw), 24px);
    --fs-h6-main: clamp(18px, min(6.75cqi, 17.333px + 0.1667vw), 20px);
 */
	
	
	
	
	function roundToStep(value, step = 0.125) {
		return Math.round(value / step) * step;
	}
	
	function getScaleValues(base, min, curve, levels) {
		let values = [base];

		// target incremental drop pattern (key idea)
		let step = (base - min) / 10; // small normalized step

		for (let i = 1; i < levels; i++) {
			const t = i / (levels - 1);

			// VERY soft easing only (not full curve)
			const ease = 1 - Math.pow(1 - t, curve);
			const delta = step * (1 + (1 - ease) * 2);

			values[i] = values[i - 1] - delta;
		}

		// normalize last value exactly to min
		const correction = values[levels - 1] - min;
		for (let i = 0; i < levels; i++) {
			values[i] -= (i / (levels - 1)) * correction;
		}
		
		return values;
	}
	
	
	function generateScale(base, min, curve, levels) {
		base = baseInput.value;
		min = minInput.value;
		curve = curveInput.value; // 1.2–1.6 ideal
		levels = levels ?? 6;
		
		base = parseFloat(base);
		min = parseFloat(min);
		curve = parseFloat(curve);
		
		
		console.log(base, min, curve, levels);
		
		let values = getScaleValues(base, min, curve, levels);
		

		let css = ":root {\n";

		css += "  --fs-h1: min(var(--fs-h1-main), var(--cqi-fixer-h1));\n";
		css += "  --fs-h2: min(var(--fs-h2-main), var(--cqi-fixer-h2));\n";
		css += "  --fs-h3: min(var(--fs-h3-main), var(--cqi-fixer-h3));\n";
		css += "  --fs-h4: min(var(--fs-h4-main), var(--cqi-fixer-h4));\n";
		css += "  --fs-h5: min(var(--fs-h5-main), var(--cqi-fixer-h5));\n";
		css += "  --fs-h6: min(var(--fs-h6-main), var(--cqi-fixer-h6));\n";
		css += "\n";	

		for (let i = 0; i < levels; i++) {
			const rounded = roundToStep(values[i], 0.0625);

			const v = rounded.toFixed(4).replace(/\.?0+$/, '');
			css += `  --cqi-fixer-h${i + 1}: ${v}cqi;\n`;
		}

		css += "}\n";

		output.value = css;

		updateLiveCSS(output);
		// liveCSS.textContent = css;
	}


	function updateLiveCSS(element) {
		
		
		var newCSS = element.currentTarget ? element.currentTarget.value : element.value;
		newCSS += ':root{' + inputCSS.value + '}';
		console.log(':root{' + inputCSS.value + '}');
		liveCSS.textContent = newCSS;
	}

	
	
	

	// inputCSS.addEventListener('input', updateLiveCSS);

	// inputCSS.addEventListener('input', async () => {
	// 	updateLiveCSS;
	// });
	
	
	document.getElementById('generate').addEventListener('click', generateScale);
	baseInput.addEventListener('input', generateScale);
	minInput.addEventListener('input', generateScale);
	curveInput.addEventListener('input', generateScale);
	output.addEventListener('input', updateLiveCSS);
	inputCSS.addEventListener('input', updateLiveCSS(output));
	

	document.getElementById('copy').addEventListener('click', async () => {
		await navigator.clipboard.writeText(output.value);
	});

	generateScale(baseInput.value, minInput.value, curveInput.value, 6);
	
	
// 	END Type scale
	
	
	
	
	
// 	Generator
	
	// 	create data in tbody
	const tbody = document.querySelector('.data tbody');

	const tags = ['h1','h2','h3','h4','h5','h6','p'];

	const cells = [
		{ cls: 'element', editable: false },
		{ cls: 'min-size', editable: true },
		{ cls: 'max-size', editable: true },
		{ cls: 'min-viewport', editable: true },
		{ cls: 'max-viewport', editable: true },
		{ cls: 'min-row-w hidden', editable: true },
		{ cls: 'max-row-w hidden', editable: true }
	];

	tags.forEach(tag => {
		const tr = document.createElement('tr');

		cells.forEach((cell, i) => {
			const td = document.createElement('td');
			td.className = cell.cls;

			const span = document.createElement('span');

			if (i === 0) {
				span.textContent = tag;
			} else if (cell.editable) {
				span.setAttribute('contenteditable', 'true');
			}

			td.appendChild(span);
			tr.appendChild(td);
		});

		tbody.appendChild(tr);
	});
	
	
	
	
	
	const config = {
		min_vp: 400,
		max_vp: 1600,
		min_row_w: 90,
		max_row_w: 80
	};

	const ctrl = new Pane({
		title: "Defaults",
		expanded: false
	});

	const minVPBinding = ctrl.addBinding(config, "min_vp", {
		label: "Min viewport",
		min: 320,
		max: 2400,
		format: (v) => v.toFixed(0)
	});

	const maxVPBinding = ctrl.addBinding(config, "max_vp", {
		label: "Max row",
		min: 320,
		max: 2400,
		format: (v) => v.toFixed(0)
	});
	
	const minRowWBinding = ctrl.addBinding(config, "min_row_w", {
		label: "Min row width",
		min: 0,
		max: 100,
		format: (v) => v.toFixed(0)
	});

	const maxRowWBinding = ctrl.addBinding(config, "max_row_w", {
		label: "Max row width",
		min: 0,
		max: 100,
		format: (v) => v.toFixed(0)
	});

	function updateElement(selector, value) {
		const elements = document.querySelectorAll(selector);
		elements.forEach(function (element) {
			if (!element.classList.contains("locked")) {
				const span = element.querySelector("span:not(.lock)");
				if (span) {
					span.innerText = value.toFixed(0);
				}
			}
		});
	}

	function applyDefault(el, value) {
		$(el).text(value.toFixed(0));
	}

	minVPBinding.on("change", (ev) => {
		updateElement("tbody .min-viewport", ev.value);
	});

	maxVPBinding.on("change", (ev) => {
		updateElement("tbody .max-viewport", ev.value);
	});
	
	
	minRowWBinding.on("change", (ev) => {
		updateElement("tbody .min-row-w", ev.value);
	});
	
	maxRowWBinding.on("change", (ev) => {
		updateElement("tbody .max-row-w", ev.value);
	});
	

	updateElement("tbody .min-viewport", config.min_vp);
	updateElement("tbody .max-viewport", config.max_vp);
	updateElement("tbody .min-row-w", config.min_row_w);
	updateElement("tbody .max-row-w", config.max_row_w);

	const change = () => {
		GenerateResults();
	};

	ctrl.on("change", change);

	// Add lock btns
	$("tbody td:is(.min-viewport, .max-viewport, .min-row-w, .max-row-w)").append(
		// '<span class="lock"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd" /></svg></span>'
		'<span class="lock"></span>'
	);

	jQuery("body").on("click", ".delete", function () {
		$(".data tbody tr > td:not(.element) > span").each(function () {
			$(this).text("");
			$("tr.custom-tr").remove();
			$(".results-wrapper").hide();
		});
		Notif("Values deleted");
	});

	jQuery("body").on("click", ".clear", function () {
		$(".data tbody tr > td:not(.element) > span").each(function () {
			$(this).text("");
			// Notif('Values cleared');
		});
		Notif_link("Values cleared", "See page", "#");
	});

	jQuery(".table-wrapper:has(.data)").on("click", ".add", function () {
		let last_tr = $("table.data tbody tr:last-child").clone();

		last_tr.find("td").each(function () {
			if ($(this).hasClass("locked")) {
				$(this).removeClass("locked");
			}
			if ($(this).hasClass("min-viewport")) {
				applyDefault($(this).find("span:not(.lock)"), config.min_vp);
			} else if ($(this).hasClass("max-viewport")) {
				applyDefault($(this).find("span:not(.lock)"), config.max_vp);
			} else if ($(this).hasClass("min-row-w")) {
				applyDefault($(this).find("span:not(.lock)"), config.min_row_w);
			} else if ($(this).hasClass("max-row-w")) {
				applyDefault($(this).find("span:not(.lock)"), config.max_row_w);
			} else {
				$(this).find("span").empty();
			}
		});

		last_tr.find(".element span").attr("contenteditable", "true");
		if (!last_tr.hasClass("custom-tr")) {
			last_tr.addClass("custom-tr");
		}
		last_tr.appendTo(".data tbody");
	});

	function pxToRem(px) {
		return parseFloat((px / 16).toFixed(4)) + "rem";
	}

	$('input[name="px-rem"], input[name=vw-cqi]').change(function () {
		const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
		if (jQuery(".custom-css .css").length > 0) {
			GenerateResults(vw_or_vwCQI);
		}
	});
	
	// $('input[name="vw-cqi"]').change(function () {
	// 	const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
	// 	if (jQuery(".custom-css .css").length > 0) {
	// 		GenerateResults(vw_or_vwCQI);
	// 	}
	// });

	jQuery(".generate").click(function () {
		const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
		GenerateResults(vw_or_vwCQI);
		
		// if (vw_or_vwCQI == 'vw-cqi') {
		// 	GenerateResults(vw_or_vwCQI);
		// } else {
		// 	GenerateResults();
		// }
		
	});

	
	function generateSlope(min_size, max_size, min_vp, max_vp) {
		return (max_size - min_size) / (max_vp - min_vp);
	}
	
	
	function GenerateResults(output_mode) {
		
		
		var resultText = "";
		var values_array = [];
		
		// console.log(output_mode);

		jQuery("tbody tr").each(function () {
			// var element = "";

			// var min_size = "";
			// var max_size = "";
			// var min_viewport = "";
			// var max_viewport = "";
			// var min_row_w = "";
			// var max_row_w = "";

// 			V2
			
			let fields = {
				min_size: '.min-size',
				max_size: '.max-size',
				min_viewport: '.min-viewport',
				max_viewport: '.max-viewport',
				min_row_w: '.min-row-w',
				max_row_w: '.max-row-w'
		};

		let values = {};

		jQuery.each(fields, function(key, selector) {
				let text = jQuery(this).children(selector).text().trim();

				if (text.length) {
						values[key] = parseFloat(text);
				}
		}.bind(this)); // keep correct context
			
			
			// destructuring (cleaner)
			let {
					min_size,
					max_size,
					min_viewport,
					max_viewport,
					min_row_w,
					max_row_w
			} = values;
			
// 			min_size = values.min_size;
// 			max_size = values.max_size;
// 			min_viewport = values.min_viewport;
// 			max_viewport = values.max_viewport;
// 			min_row_w = values.min_row_w;
// 			max_row_w = values.max_row_w;
			
			
			
			
			
			

		// usage
		// console.log(values.min_size);
			
			// V1
// 			if (jQuery(this).children(".min-size").text().length) {
// 				min_size = parseFloat(jQuery(this).children(".min-size").text());
// 			}

// 			if (jQuery(this).children(".max-size").text().length) {
// 				max_size = parseFloat(jQuery(this).children(".max-size").text());
// 			}

// 			if (jQuery(this).children(".min-viewport").text().length) {
// 				min_viewport = parseFloat(jQuery(this).children(".min-viewport").text());
// 			}

// 			if (jQuery(this).children(".max-viewport").text().length) {
// 				max_viewport = parseFloat(jQuery(this).children(".max-viewport").text());
// 			}
			
// 			if (jQuery(this).children(".min-row-w").text().length) {
// 				min_row_w = parseFloat(jQuery(this).children(".min-row-w").text());
// 			}
			
// 			if (jQuery(this).children(".max-row-w").text().length) {
// 				max_row_w = parseFloat(jQuery(this).children(".max-row-w").text());
// 			}
			
			

			if (
				!isNaN(min_size) &&
				!isNaN(max_size) &&
				!isNaN(min_viewport) &&
				!isNaN(max_viewport) &&
				min_size !== "" &&
				max_size !== "" &&
				min_viewport !== "" &&
				max_viewport !== ""
			) {
				const px_or_rem = jQuery("input[name=px-rem]:checked").val();
				
				
				let min_clamp_size = min_size + "px";
				let max_clamp_size = max_size + "px";

				let heading = jQuery(this).children(".element").text();

				// const slope = (max_size - min_size) / (max_viewport - min_viewport);
				const slope = generateSlope(min_size, max_size, min_viewport, max_viewport)
				
				
				
				
				
				
				//const yAxisIntersection =  -min_viewport * slope + min_size;
				//const preferredFontSize = (yAxisIntersection / 16).toFixed(3) + 'rem + ' + (slope * 100 ).toFixed(3) + 'vw';
				//const clampValue = `clamp(${minFontSizeRem}, ${preferredFontSize}, ${maxFontSizeRem})`;

				const yAxisIntersection = min_size - slope * min_viewport;
				let preferredFontSizePxRem = parseFloat(yAxisIntersection.toFixed(3));

				if (px_or_rem == "rem") {
					min_clamp_size = pxToRem(min_size);
					max_clamp_size = pxToRem(max_size);
					preferredFontSizePxRem = pxToRem(preferredFontSizePxRem);
				} else {
					preferredFontSizePxRem = preferredFontSizePxRem + "px";
				}

				const preferredFontSizeVw = parseFloat((slope * 100).toFixed(4));
				
				let preferedUnit = output_mode == 'cqi' ? 'cqi' : 'vw';
				let preferredFontSizeOutput = `${preferredFontSizePxRem} + ${preferredFontSizeVw}${preferedUnit}`;
				// let preferredFontSizeOutput = `${preferredFontSizePxRem} + ${preferredFontSizeVw}vw`;
				
				
				console.log(jQuery('#generate-typescale').is(":checked"));
				
				if(output_mode == 'vw-cqi') {
				// if(output_mode == 'vw-cqi' && !jQuery('#generate-typescale').is(":checked")) {
					if(!isNaN(min_row_w) && !isNaN(max_row_w)) {
						
						let min_viewport_CQI = min_viewport * (min_row_w/100);
						let max_viewport_CQI = max_viewport * (max_row_w/100);

						const slopeCQI = generateSlope(min_size, max_size, min_viewport_CQI, max_viewport_CQI);
						const yAxisIntersection_for_CQI = min_size - slopeCQI * min_viewport_CQI;
						let preferredFontSizePxRem_for_CQI = parseFloat(yAxisIntersection_for_CQI.toFixed(3));
						
						if (px_or_rem == "rem") {
							preferredFontSizePxRem_for_CQI = pxToRem(preferredFontSizePxRem_for_CQI);
						} else {
							preferredFontSizePxRem_for_CQI = preferredFontSizePxRem_for_CQI + "px";
						}

						const preferredFontSizeCQI = parseFloat((slopeCQI * 100).toFixed(4));
						preferredFontSizeOutput = `min(${preferredFontSizePxRem_for_CQI} + ${preferredFontSizeCQI}cqi, ${preferredFontSizeOutput})`
						
						
					}
					
					
				} else if(output_mode == 'vw-cqi' && jQuery('#generate-typescale').is(":checked")) {
					
// 					TODO Generate scale for clamp(min( "cqi" ))
					
					preferredFontSizeOutput = `min(10cqi, ${preferredFontSizeOutput})`
				}
				
				
				const clampValue = `clamp(${min_clamp_size}, ${preferredFontSizeOutput}, ${max_clamp_size})`;
				if(!jQuery('#generate-typescale').is(":checked")) {
					resultText = resultText + heading + " { font-size: " + clampValue + "; }";
				} else {
					resultText = resultText + '--fs-'+heading + "-main: " + clampValue + ";";
				 }
				
				

				values_array.push(heading + ", " + clampValue);

				if (resultText.length != 0) {
					resultText = resultText + "<br>";
				}
			}
		});

		$(".results tbody").empty();

		if (values_array.length) {
			// Styles for visualizer
			
			if(!jQuery('#generate-typescale').is(":checked")) {
				$("body style").text(
					resultText
						.replaceAll("<br>", "")
						.replace(/(h[1-6])(.*?)/g, "$1.custom-size$2")
					);
				} else {
					$("body style").text(':root{' + 
					resultText.replaceAll("<br>", "") + '}'
						// .replaceAll("<br>", "")
						// .replace(/(h[1-6])(.*?)/g, "$1:$2") + '}'
				);
					
					jQuery('#input-css').val(resultText.replaceAll("<br>", ""));
					
					document.getElementById('generate').click();
					updateFontSize()
					// generateScale;
			}
			
			
			

			$(".results-wrapper").show();
			$(".custom-css .css").html(':root{' + resultText + '}');

			for (let i = 0; i < values_array.length; ++i) {
				let element = values_array[i].substring(0, values_array[i].indexOf(", "));
				let value = values_array[i].substring(values_array[i].indexOf(", ") + 1);

				jQuery(".results tbody").append(
					'<tr><td class="element">' +
						element +
						'</td><td class="value">' +
						value +
						"</td></tr>"
				);
			}

			Notif("Generated");
		} else {
			$(".results-wrapper").hide();
		}
	}

	// Visibility output-inputs-wrap
	
	$('.output-inputs-wrap input').click(function(){
		let value = $(this).val();
		if (value == 'vw-cqi') {
			$('.min-row-w, .max-row-w').removeClass('hidden');
		} else {
			$('.min-row-w, .max-row-w').addClass('hidden');
		}
	});
	
	
	jQuery(".table-wrapper:has(.data)").on(
	"keypress",
	'[class*="min-"] span[contenteditable], [class*="max-"] span[contenteditable]',
	function (e) {
		if (isNaN(String.fromCharCode(e.which))) {
			e.preventDefault();
		}
	}
);
	
	
	// 	Accordion

	$(".custom-css .title").click(function () {
		$(".custom-css .css").toggleClass("hidden visible");
		// $(".custom-css .css").slideToggle();
		
	});

	/* Copy */

	$(document).on(
		"click",
		".results tbody td.element, .results tbody td.value, .custom-css .css",
		function () {
			copyToClipboard($(this));
		}
	);

	function copyToClipboard(element) {
		var $temp = $("<input>");
		$("body").append($temp);

		// console.log($(element).text());

		$temp.val($(element).text().trim()).select();
		document.execCommand("copy");
		$temp.remove();
	}

	/* Lock */

	$(document).on("click", ".lock", function () {
		$(this).parent("td").toggleClass("locked");
	});

	
	
	
	
	/* Deconstruct */
// clamp(20px, min(23.913px + -1.087cqi, 23.333px + -0.8333vw), 10px)
	$(".deconstruct").click(function () {
		// ex		clamp(20px, 5.789px + 3.1579vw, 50px)
		var clampValue = $(".clamp-value").text();
		
		let cqi = clampValue.includes('cqi');
		let matches = '';
		
		// let matches = clampValue.match(
		// 	/clamp\(([^,]+), ([^+]+) \+ ([^,]+), ([^)]+)\)/
		// );
		
		if (!cqi) {
			matches = clampValue.match(
			/clamp\(([^,]+), ([^+]+) \+ ([^,]+), ([^)]+)\)/
		);
		} else {
			matches = clampValue.match(
			/clamp\(([^,]+), min\(([^+]+) \+ ([^,]+), ([^+]+) \+ ([^)]+)\), ([^)]+)\)/
		);
		}
		
		// console.log(matches, cqi);
		
		
		const rootFontSize = 16;
		var unit = "px";

		if (matches) {
			const convertToPx = (value) => {
				if (value.includes("rem")) {
					// unit = 'rem';
					return parseFloat(value) * rootFontSize; // Convert rem to px
				}
				return parseFloat(value); // Already in px
			};

			
			let minValue = ''; // 1.25rem -> px
			let baseValue = ''; // 0.6579rem -> px
			let fluidValue = ''; // vw stays as-is
			let maxValue = ''; // 2.5rem -> px
			
			let baseValue2 = '';
			let fluidValue2 = ''; 
			
			let output_min_viewport = '';
			let output_max_viewport = '';
			let output_min_row_w = '';
			let output_max_row_w = '';
			
			
			
			
			
			if (!cqi) {
				// let minValue = matches[1].trim();
				// let baseValue = matches[2].trim();
				// let fluidValue = matches[3].trim();
				// let maxValue = matches[4].trim();
				minValue = convertToPx(matches[1].trim()); // 1.25rem -> px
				baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
				fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
				maxValue = convertToPx(matches[4].trim()); // 2.5rem -> px
			} else {
				
				minValue = convertToPx(matches[1].trim()); // 1.25rem -> px
				// baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
				// fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
				
				maxValue = convertToPx(matches[6].trim()); // 2.5rem -> px
				
				
				
				if (matches[3].trim().includes('vw')) {
					// console.log("vw");
					// vw
					baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
					fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
					
					//cqi
					baseValue2 = convertToPx(matches[4].trim()); // 0.6579rem -> px
					fluidValue2 = parseFloat(matches[5].trim()); // vw stays as-is
				} else {
					// console.log("cqi");
					// vw
					baseValue = convertToPx(matches[4].trim()); // 0.6579rem -> px
					fluidValue = parseFloat(matches[5].trim()); // vw stays as-is
					
					// cqi
					baseValue2 = convertToPx(matches[2].trim()); // 0.6579rem -> px
					fluidValue2 = parseFloat(matches[3].trim()); // vw stays as-is
				}
				
			}

			$(".deconstruct_min-size > span.value").text(minValue);
			$(".deconstruct_max-size > span.value").text(maxValue);

			// minValue = parseFloat(minValue); // 20px
			// baseValue = parseFloat(baseValue); // 5.789px
			// fluidValue = parseFloat(fluidValue); // 3.1579vw
			// maxValue = parseFloat(maxValue); // 50px

			
			let values_from_vw = get_min_max_from_values(baseValue, fluidValue, minValue, maxValue);
			
			// console.log(values_from_vw);
			const viewportAtMin = values_from_vw[0]; // in vw
			const viewportAtMax = values_from_vw[1]; // in vw
			
			// Calculate the viewports
			// const viewportAtMin = (minValue - baseValue) / fluidValue; // in vw
			// const viewportAtMax = (maxValue - baseValue) / fluidValue; // in vw

			// console.log(viewportAtMin);
			// clamp(21px, 10.867px + 2.5333vw, 59px)
			
			output_min_viewport = parseInt(Math.round(viewportAtMin * 100));
			output_max_viewport = parseInt(Math.round(viewportAtMax * 100));
			

			$(".deconstruct_min-viewport > span.value").text(
				output_min_viewport
			);
			$(".deconstruct_max-viewport > span.value").text(output_max_viewport);

			// $('.deconstruct_min-viewport > span.value').text(parseInt(viewportAtMin*100)) ;
			// $('.deconstruct_max-viewport > span.value').text(parseInt(viewportAtMax*100));
				
			
			
			
			
			if (cqi) {
				let values_from_cqi = get_min_max_from_values(baseValue2, fluidValue2, minValue, maxValue);
			
				// console.log(values_from_cqi);
				let widthAtMin = values_from_cqi[0]; // in vw
				let widthAtMax = values_from_cqi[1]; // in vw
				
				
				let min_row_w = parseInt(Math.round(widthAtMin * 100));
				let max_row_w = 	parseInt(Math.round(widthAtMax * 100));
				
				output_min_row_w = (min_row_w / output_min_viewport) * 100;
				output_max_row_w = (max_row_w / output_max_viewport) * 100;
				
				
				$(".deconstruct_min-row-w > span.value").text(output_min_row_w);
				$(".deconstruct_max-row-w > span.value").text(output_max_row_w);
				
				$(".deconstruct_min-row-w, .deconstruct_max-row-w").removeClass('hidden');
			} else {
				$(".deconstruct_min-row-w, .deconstruct_max-row-w").addClass('hidden');
			}
		}

		copyDeconstruct();
	});


	function copyDeconstruct() {
  // explicit table-column order so it pastes straight into a table row
  const order = [
    '.deconstruct_min-size',
    '.deconstruct_max-size',
    '.deconstruct_min-viewport',
    '.deconstruct_max-viewport',
    '.deconstruct_min-row-w',
    '.deconstruct_max-row-w'
  ];

  const values = order.map(sel => {
    const wrapper = document.querySelector(sel);
    if (!wrapper || wrapper.classList.contains('hidden')) return ''; // skip when not in cqi mode
    const valEl = wrapper.querySelector('.value');
    return valEl ? valEl.textContent.trim() : '';
  });

  const text = values.join('\t');

  navigator.clipboard.writeText(text).then(() => {
    Notif('Values copied');
  }).catch(err => {
    console.error('Copy failed', err);
  });
}

	function get_min_max_from_values(base, fluid, min, max) {
		let widthAtMin = (min - base) / fluid; // in vw
		let widthAtMax = (max - base) / fluid; // in vw
		
		return [widthAtMin, widthAtMax];
	}
	
// 	Converter
	// $('.convert').click(function(){
	// 	let original = parseInt($('.converter .original').text());
	// 	let wanted = parseInt($('.converter .wanted').text());
		
	// 	$('.converter .em').text((wanted / original).toFixed(4).replace(/\.?0+$/, ''));
		
	// });



	$(document).on('input', '.converter .original, .converter .wanted', function() {		
		convertWantedToEm();
	});

	function convertWantedToEm() {
		let original = parseInt($('.converter .original').text());
		let wanted = parseInt($('.converter .wanted').text());

		if (!isNaN(original) && !isNaN(wanted)) {
			$('.converter .em').text((wanted / original).toFixed(4).replace(/\.?0+$/, ''));
		} else {
			$('.converter .em').text('');
		}
	}
	
	

	// 	Visualiser
	
	const visualizer_container = document.querySelector('.visualizer');

	const visualizer_tags = ['h1','h2','h3','h4','h5','h6'];

	const titleText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
	const paragraphText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor eligendi unde, ipsa dolorum quos quaerat alias assumenda et ducimus. Vero, culpa nisi facere nostrum dicta accusamus. Praesentium ullam exercitationem atque iure et doloremque. Voluptatum exercitationem quaerat, inventore expedita assumenda corrupti ab praesentium quia corporis illum est magni aperiam natus blanditiis!';

	tags.forEach(visualizer_tag => {
		const wrapper = document.createElement('div');

		const label = document.createElement('span');
		label.className = 'unit';
		label.textContent = visualizer_tag;

		const inner = document.createElement('div');

		const heading = document.createElement(visualizer_tag);
		heading.className = 'custom-size';
		heading.textContent = titleText;

		const p = document.createElement('p');
		p.className = 'custom-size hidden';
		p.textContent = paragraphText;

		inner.appendChild(heading);
		inner.appendChild(p);

		wrapper.appendChild(label);
		wrapper.appendChild(inner);

		visualizer_container.appendChild(wrapper);
	});
	
	
	
	
	
	
	
	
	$(".visualizer > div p").hide();

	$(".visualizer > div").click(function () {
		$(this).find("p").toggleClass("hidden visible");
		$(this).find("p").slideToggle();
	});

	// 	Navigation
	$(".navigation .page-toggle").click(function () {
		$(".page-toggle.active").not($(this)).removeClass("active");
		$(this).addClass("active");

		// Change page title
		var string = $(this).attr("data-page");
		var newString = string[0].toUpperCase() + string.slice(1);
		$(".page-title").text(newString);

		// Show page
		showPage($(this).data("page"));
	});

	function showPage(page) {
		$(".page.active")
			.not($('.page[data-page="' + page + '"]'))
			.removeClass("active");
		$('.page[data-page="' + page + '"]').addClass("active");
	}
	
	
	
	
	
	
	
	
	

	
	
	
	
	
// 	Multiple cells selection
	
	
	const table = document.querySelector('table.data');
 
  let isMouseDown = false;
  let dragged = false;
  let anchor = null;          // {r, c} where the drag started
  let selection = null;       // {r1, c1, r2, c2} normalized
  let hasSelection = false;
  let selectionNewText = '';
 
  function getCoord(cell) {
    const tr = cell.closest('tr');
    const r = Array.prototype.indexOf.call(table.rows, tr);
    const c = Array.prototype.indexOf.call(tr.children, cell);
    return { r, c };
  }
 
  function clearHighlight() {
		selectionNewText = '';
    table.querySelectorAll('.cell-selected').forEach(el => el.classList.remove('cell-selected'));
  }
 
  function applySelection(r1, c1, r2, c2) {
    clearHighlight();
    const rmin = Math.min(r1, r2), rmax = Math.max(r1, r2);
    const cmin = Math.min(c1, c2), cmax = Math.max(c1, c2);
    for (let r = rmin; r <= rmax; r++) {
      const tr = table.rows[r];
      if (!tr) continue;
      for (let c = cmin; c <= cmax; c++) {
        const cell = tr.children[c];
        if (cell) cell.classList.add('cell-selected');
      }
    }
    selection = { r1: rmin, c1: cmin, r2: rmax, c2: cmax };
    hasSelection = true;
  }
 
  function getEditableSpan(cell) {
    return cell.querySelector(':scope > span[contenteditable="true"]');
  }
 
  function cellValue(cell) {
    const span = getEditableSpan(cell);
    return (span ? span.textContent : cell.textContent).trim();
  }
 
  // ---- selection via mouse ----
 
  table.addEventListener('mousedown', (e) => {
    // const cell = e.target.closest('td, th');
		const targetClasses = ['element'];
		
		if (!targetClasses.some(className => e.target.closest('td').classList.contains(className))) {
			
		
    const cell = e.target.closest('td');
    if (!cell || !table.contains(cell)) return;
    if (e.target.closest('.lock')) return; // let lock icon clicks behave normally
 
    // isMouseDown = true;
    // dragged = false;
    // anchor = getCoord(cell);
    // don't clear selection or preventDefault yet — a plain click should still
    // let the contenteditable span focus/edit normally
		
		isMouseDown = true;
		dragged = false;
		anchor = getCoord(cell);
		clearHighlight();
		selection = { r1: anchor.r, c1: anchor.c, r2: anchor.r, c2: anchor.c };
		hasSelection = true;
			
		}
  });
 
  table.addEventListener('mousemove', (e) => {
    if (!isMouseDown) return;
		
		const targetClasses = ['element'];
		
		if (!targetClasses.some(className => e.target.closest('td').classList.contains(className))) {
    // const cell = e.target.closest('td, th');		
    const cell = e.target.closest('td');
    if (!cell || !table.contains(cell)) return;
 
    const coord = getCoord(cell);
    if (!dragged && (coord.r !== anchor.r || coord.c !== anchor.c)) {
      dragged = true;
      table.classList.add('dragging');
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      window.getSelection().removeAllRanges();
    }
    if (dragged) applySelection(anchor.r, anchor.c, coord.r, coord.c);
			
		}
  });
 
  document.addEventListener('mouseup', () => {
    if (!isMouseDown) return;
		isMouseDown = false;
		table.classList.remove('dragging');
		
    // isMouseDown = false;
    // table.classList.remove('dragging');
    // if (!dragged) {
    //   clearHighlight();
    //   hasSelection = false;
    // }
		
		
  });
 
  document.addEventListener('mousedown', (e) => {
    if (!table.contains(e.target)) {
      clearHighlight();
      hasSelection = false;
    }
  });
 
  // ---- copy ----
 
//   document.addEventListener('copy', (e) => {
//     if (!hasSelection) return;
//     e.preventDefault();
//     const lines = [];
//     for (let r = selection.r1; r <= selection.r2; r++) {
//       const tr = table.rows[r];
//       if (!tr) continue;
//       const vals = [];
//       for (let c = selection.c1; c <= selection.c2; c++) {
//         const cell = tr.children[c];
//         vals.push(cell ? cellValue(cell) : '');
//       }
//       lines.push(vals.join('\t'));
//     }
		
// 		console.log(lines);
//     e.clipboardData.setData('text/plain', lines.join('\n'));
//   });
	
	 document.addEventListener('copy', (e) => {
    if (!hasSelection) return;
    e.preventDefault();
    const lines = [];
    for (let r = selection.r1; r <= selection.r2; r++) {
      const tr = table.rows[r];
      if (!tr) continue;
      const vals = [];
      for (let c = selection.c1; c <= selection.c2; c++) {
        const cell = tr.children[c];
        vals.push(cell ? cellValue(cell) : '');
      }
      lines.push(vals.join('\t'));
    }
    e.clipboardData.setData('text/plain', lines.join('\n'));
  });
 
 
  // ---- paste ----
 
//   document.addEventListener('paste', (e) => {
//     if (!hasSelection) return;
//     e.preventDefault();
//     const text = (e.clipboardData || window.clipboardData).getData('text/plain');
//     const rows = text.replace(/\r/g, '').split('\n');
//     while (rows.length && rows[rows.length - 1] === '') rows.pop();
 
//     let maxCols = 1;
//     rows.forEach((line, ri) => {
//       const vals = line.split('\t');
//       maxCols = Math.max(maxCols, vals.length);
//       vals.forEach((val, ci) => {
//         const tr = table.rows[selection.r1 + ri];
//         if (!tr) return;
//         const cell = tr.children[selection.c1 + ci];
//         if (!cell) return;
//         const span = getEditableSpan(cell);
//         if (span) span.textContent = val;
//       });
//     });
 
//     applySelection(
//       selection.r1, selection.c1,
//       selection.r1 + rows.length - 1,
//       selection.c1 + maxCols - 1
//     );
//   });
	
	document.addEventListener('paste', (e) => {
    if (!hasSelection) return;
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const rows = text.replace(/\r/g, '').split('\n');
    while (rows.length && rows[rows.length - 1] === '') rows.pop();
 
    let maxCols = 1;
    rows.forEach((line, ri) => {
      const vals = line.split('\t');
      maxCols = Math.max(maxCols, vals.length);
      vals.forEach((val, ci) => {
        const tr = table.rows[selection.r1 + ri];
        if (!tr) return;
        const cell = tr.children[selection.c1 + ci];
        if (!cell || cell.classList.contains('locked')) return;
        const span = getEditableSpan(cell);
        if (span) span.textContent = val;
      });
    });
 
    applySelection(
      selection.r1, selection.c1,
      selection.r1 + rows.length - 1,
      selection.c1 + maxCols - 1
    );
  });
	
	
	document.addEventListener('keydown', (e) => {
    if(!hasSelection) return;
		
		if(e.key != "Meta" && e.metaKey != true) {
			console.log(e);
			
			
			 // Move the selection with arrow keys
    const dirs = {
      ArrowLeft:  { dr: 0, dc: -1 },
      ArrowRight: { dr: 0, dc: 1 },
      ArrowUp:    { dr: -1, dc: 0 },
      ArrowDown:  { dr: 1, dc: 0 }
    };

    if (dirs[e.key]) {
      e.preventDefault(); // stop page scroll / cursor movement in the span

      const dir = dirs[e.key];
      const rowCount = table.rows.length;
      const colCount = table.rows[0].children.length; // assumes uniform column count

      const height = selection.r2 - selection.r1; // 0 for a single cell
      const width  = selection.c2 - selection.c1;

      let r1 = selection.r1 + dir.dr;
      let r2 = selection.r2 + dir.dr;
      let c1 = selection.c1 + dir.dc;
      let c2 = selection.c2 + dir.dc;

      // clamp rows while keeping the block's height intact
      if (r1 < 0) { r1 = 0; r2 = r1 + height; }
      if (r2 > rowCount - 1) { r2 = rowCount - 1; r1 = r2 - height; }

      // clamp cols while keeping the block's width intact
      if (c1 < 0) { c1 = 0; c2 = c1 + width; }
      if (c2 > colCount - 1) { c2 = colCount - 1; c1 = c2 - width; }

      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      dragged = false;
      anchor = { r: r1, c: c1 };
      applySelection(r1, c1, r2, c2);
      return; // skip the backspace/digit-typing logic below
    }
			
			if (e.key == 'Backspace') {
				selectionNewText = selectionNewText.slice(0, -1); 
			} else if (e.key.match(/^\d$/)) {
        selectionNewText = selectionNewText + e.key;
			} else if (e.key == 'Enter' || e.key == 'Escape') {
				clearHighlight();
      	hasSelection = false;
			} else {
				return;
			}
				
			table.querySelectorAll('.cell-selected:not(.locked) span[contenteditable]').forEach(el => el.textContent = selectionNewText);
		}
		
		
		
  });
	
	
	
// 	END Multiple cells selections
	
});












// Backup!!!


// // import { Pane } from 'https://esm.sh/tweakpane';
// // import { Pane } from "https://esm.sh/tweakpane@4.0.4";
// import { Pane } from "https://esm.sh/tweakpane@4.0.4";



// // import {
// // 	Notif,
// // 	Notif_link
// // } from "https://codepen.io/jean-samuel-caron/pen/oNrbMMK.js";



// jQuery(document).ready(function () {
	
	
	
// 	// Type scale
	
	
	
// 	function updateFontSize() {
// 		jQuery('h1,h2,h3,h4,h5,h6,p').each(function(){
// 			var size = jQuery(this).css('font-size');
// 			jQuery(this).attr('data-size', size);
// 		});
// 	}

// 	jQuery(window).on('load resize', updateFontSize);


// 	function onInput(element) {
// 		var newText = element.currentTarget.value;
// 		jQuery('.type-scale :is(h1,h2,h3,h4,h5,h6)').text(newText);
// 	}

// 	jQuery('#replace-titles').on('input', onInput);
	
	
	
	
	
	
// // 	Sidebar
// 	const sidebar = document.getElementById('sidebar');
// 	const openSidebar = document.getElementById('open-sidebar');
// 	openSidebar.addEventListener('click', async () => {
	
// 		if (sidebar.style.display === "none") {
// 			sidebar.style.display = "block";
// 		} else {
// 			sidebar.style.display = "none";
// 		}
	
// 	});
	
// 	// 	END Sidebar
	
	
// 	// Create layouts
	
// 	const container = document.querySelector('.sections');

// 	const configs = [
// 		{ key: '1', cols: 1 },
// 		{ key: '2', cols: 2 },
// 		{ key: '3', cols: 3 },
// 		{ key: '4', cols: 4 },
// 		{ key: '5', cols: 5 },
// 		{ key: '2-1-1', cols: [2,1,1] }
// 	];

// 	const wrappers = [
// 		{ title: c => `${c} column${c > 1 ? 's' : ''} | 90%`, fw: true, noPad: false },
// 		{ title: c => `${c} column${c > 1 ? 's' : ''} | max-width 1600px - 90%`, fw: false, noPad: true },
// 		{ title: c => `${c} column${c > 1 ? 's' : ''} with padding | max-width 1600px - 90%`, fw: false, noPad: false }
// 	];

// 	const contentHTML = `
// 		<h1>Test h1 size</h1>
// 		<h2>Test h2 size</h2>
// 		<h3>Test h3 size</h3>
// 		<h4>Test h4 size</h4>
// 		<h5>Test h5 size</h5>
// 		<h6>Test h6 size</h6>
// 		<p>Test p size</p>
// 	`;

// 	configs.forEach(cfg => {
// 		const section = document.createElement('div');
// 		section.className = 'section';
// 		section.dataset.columns = cfg.key;

// 		const colCount = Array.isArray(cfg.cols) ? cfg.cols.length : cfg.cols;

// 		wrappers.forEach(w => {
// 			const wrapper = document.createElement('div');
// 			wrapper.className = 'wrapper';

// 			const title = document.createElement('div');
// 			title.className = 'title';
// 			title.textContent = w.title(colCount);

// 			const columns = document.createElement('div');
// 			columns.className = 'columns' + (w.fw ? ' fw' : '');

// 			for (let i = 0; i < colCount; i++) {
// 				const col = document.createElement('div');
// 				col.className = 'column' + (w.noPad ? ' no-pad' : '');

// 				// only fill first column (like your HTML)
// 				if (i === 0 || cfg.key === '2-1-1' && i < 2) {
// 					col.innerHTML = contentHTML;
// 				}

// 				columns.appendChild(col);
// 			}

// 			wrapper.appendChild(title);
// 			wrapper.appendChild(columns);
// 			section.appendChild(wrapper);
// 		});

// 		container.appendChild(section);
// 	});
	
	
	
	
	
	
	
	
	

	
	
	
// 	const baseInput = document.getElementById('base');
// 	const minInput = document.getElementById('ratio'); // rename later if needed
// 	const curveInput = document.getElementById('curve'); // NEW INPUT
// 	const output = document.getElementById('output');
// 	const inputCSS = document.getElementById('input-css');
// 	const liveCSS = document.getElementById('live-css');
	
//  /*
//  --fs-h1-main: clamp(33px, min(10cqi, 27.333px + 1.4167vw), 50px);
//     --fs-h2-main: clamp(30px, min(9cqi, 26px + 1vw), 42px);
//     --fs-h3-main: clamp(26px, min(8.5cqi, 23px + 0.75vw), 35px);
//     --fs-h4-main: clamp(23px, min(7.75cqi, 20.667px + 0.5833vw), 30px);
//     --fs-h5-main: clamp(20px, min(7.25cqi, 18.667px + 0.3333vw), 24px);
//     --fs-h6-main: clamp(18px, min(6.75cqi, 17.333px + 0.1667vw), 20px);
//  */
	
	
	
	
// 	function roundToStep(value, step = 0.125) {
// 		return Math.round(value / step) * step;
// 	}
	
// 	function getScaleValues(base, min, curve, levels) {
// 		let values = [base];

// 		// target incremental drop pattern (key idea)
// 		let step = (base - min) / 10; // small normalized step

// 		for (let i = 1; i < levels; i++) {
// 			const t = i / (levels - 1);

// 			// VERY soft easing only (not full curve)
// 			const ease = 1 - Math.pow(1 - t, curve);
// 			const delta = step * (1 + (1 - ease) * 2);

// 			values[i] = values[i - 1] - delta;
// 		}

// 		// normalize last value exactly to min
// 		const correction = values[levels - 1] - min;
// 		for (let i = 0; i < levels; i++) {
// 			values[i] -= (i / (levels - 1)) * correction;
// 		}
		
// 		return values;
// 	}
	
	
// 	function generateScale(base, min, curve, levels) {
// 		base = baseInput.value;
// 		min = minInput.value;
// 		curve = curveInput.value; // 1.2–1.6 ideal
// 		levels = levels ?? 6;
		
// 		base = parseFloat(base);
// 		min = parseFloat(min);
// 		curve = parseFloat(curve);
		
		
// 		console.log(base, min, curve, levels);
		
// 		let values = getScaleValues(base, min, curve, levels);
		

// 		let css = ":root {\n";

// 		css += "  --fs-h1: min(var(--fs-h1-main), var(--cqi-fixer-h1));\n";
// 		css += "  --fs-h2: min(var(--fs-h2-main), var(--cqi-fixer-h2));\n";
// 		css += "  --fs-h3: min(var(--fs-h3-main), var(--cqi-fixer-h3));\n";
// 		css += "  --fs-h4: min(var(--fs-h4-main), var(--cqi-fixer-h4));\n";
// 		css += "  --fs-h5: min(var(--fs-h5-main), var(--cqi-fixer-h5));\n";
// 		css += "  --fs-h6: min(var(--fs-h6-main), var(--cqi-fixer-h6));\n";
// 		css += "\n";	

// 		for (let i = 0; i < levels; i++) {
// 			const rounded = roundToStep(values[i], 0.0625);

// 			const v = rounded.toFixed(4).replace(/\.?0+$/, '');
// 			css += `  --cqi-fixer-h${i + 1}: ${v}cqi;\n`;
// 		}

// 		css += "}\n";

// 		output.value = css;

// 		updateLiveCSS(output);
// 		// liveCSS.textContent = css;
// 	}


// 	function updateLiveCSS(element) {
		
		
// 		var newCSS = element.currentTarget ? element.currentTarget.value : element.value;
// 		newCSS += ':root{' + inputCSS.value + '}';
// 		console.log(':root{' + inputCSS.value + '}');
// 		liveCSS.textContent = newCSS;
// 	}

	
	
	

// 	// inputCSS.addEventListener('input', updateLiveCSS);

// 	// inputCSS.addEventListener('input', async () => {
// 	// 	updateLiveCSS;
// 	// });
	
	
// 	document.getElementById('generate').addEventListener('click', generateScale);
// 	baseInput.addEventListener('input', generateScale);
// 	minInput.addEventListener('input', generateScale);
// 	curveInput.addEventListener('input', generateScale);
// 	output.addEventListener('input', updateLiveCSS);
// 	inputCSS.addEventListener('input', updateLiveCSS(output));
	

// 	document.getElementById('copy').addEventListener('click', async () => {
// 		await navigator.clipboard.writeText(output.value);
// 	});

// 	generateScale(baseInput.value, minInput.value, curveInput.value, 6);
	
	
// // 	END Type scale
	
	
	
	
	
// // 	Generator
	
// 	// 	create data in tbody
// 	const tbody = document.querySelector('.data tbody');

// 	const tags = ['h1','h2','h3','h4','h5','h6','p'];

// 	const cells = [
// 		{ cls: 'element', editable: false },
// 		{ cls: 'min-size', editable: true },
// 		{ cls: 'max-size', editable: true },
// 		{ cls: 'min-viewport', editable: true },
// 		{ cls: 'max-viewport', editable: true },
// 		{ cls: 'min-row-w hidden', editable: true },
// 		{ cls: 'max-row-w hidden', editable: true }
// 	];

// 	tags.forEach(tag => {
// 		const tr = document.createElement('tr');

// 		cells.forEach((cell, i) => {
// 			const td = document.createElement('td');
// 			td.className = cell.cls;

// 			const span = document.createElement('span');

// 			if (i === 0) {
// 				span.textContent = tag;
// 			} else if (cell.editable) {
// 				span.setAttribute('contenteditable', 'true');
// 			}

// 			td.appendChild(span);
// 			tr.appendChild(td);
// 		});

// 		tbody.appendChild(tr);
// 	});
	
	
	
	
	
// 	const config = {
// 		min_vp: 400,
// 		max_vp: 1600,
// 		min_row_w: 90,
// 		max_row_w: 80
// 	};

// 	const ctrl = new Pane({
// 		title: "Defaults",
// 		expanded: false
// 	});

// 	const minVPBinding = ctrl.addBinding(config, "min_vp", {
// 		label: "Min viewport",
// 		min: 320,
// 		max: 2400,
// 		format: (v) => v.toFixed(0)
// 	});

// 	const maxVPBinding = ctrl.addBinding(config, "max_vp", {
// 		label: "Max row",
// 		min: 320,
// 		max: 2400,
// 		format: (v) => v.toFixed(0)
// 	});
	
// 	const minRowWBinding = ctrl.addBinding(config, "min_row_w", {
// 		label: "Min row width",
// 		min: 0,
// 		max: 100,
// 		format: (v) => v.toFixed(0)
// 	});

// 	const maxRowWBinding = ctrl.addBinding(config, "max_row_w", {
// 		label: "Max row width",
// 		min: 0,
// 		max: 100,
// 		format: (v) => v.toFixed(0)
// 	});

// 	function updateElement(selector, value) {
// 		const elements = document.querySelectorAll(selector);
// 		elements.forEach(function (element) {
// 			if (!element.classList.contains("locked")) {
// 				const span = element.querySelector("span:not(.lock)");
// 				if (span) {
// 					span.innerText = value.toFixed(0);
// 				}
// 			}
// 		});
// 	}

// 	function applyDefault(el, value) {
// 		$(el).text(value.toFixed(0));
// 	}

// 	minVPBinding.on("change", (ev) => {
// 		updateElement("tbody .min-viewport", ev.value);
// 	});

// 	maxVPBinding.on("change", (ev) => {
// 		updateElement("tbody .max-viewport", ev.value);
// 	});
	
	
// 	minRowWBinding.on("change", (ev) => {
// 		updateElement("tbody .min-row-w", ev.value);
// 	});
	
// 	maxRowWBinding.on("change", (ev) => {
// 		updateElement("tbody .max-row-w", ev.value);
// 	});
	

// 	updateElement("tbody .min-viewport", config.min_vp);
// 	updateElement("tbody .max-viewport", config.max_vp);
// 	updateElement("tbody .min-row-w", config.min_row_w);
// 	updateElement("tbody .max-row-w", config.max_row_w);

// 	const change = () => {
// 		GenerateResults();
// 	};

// 	ctrl.on("change", change);

// 	// Add lock btns
// 	$("tbody td:is(.min-viewport, .max-viewport, .min-row-w, .max-row-w)").append(
// 		// '<span class="lock"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path fill-rule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clip-rule="evenodd" /></svg></span>'
// 		'<span class="lock"></span>'
// 	);

// 	jQuery("body").on("click", ".delete", function () {
// 		$(".data tbody tr > td:not(.element) > span").each(function () {
// 			$(this).text("");
// 			$("tr.custom-tr").remove();
// 			$(".results-wrapper").hide();
// 		});
// 		Notif("Values deleted");
// 	});

// 	jQuery("body").on("click", ".clear", function () {
// 		$(".data tbody tr > td:not(.element) > span").each(function () {
// 			$(this).text("");
// 			// Notif('Values cleared');
// 		});
// 		Notif_link("Values cleared", "See page", "#");
// 	});

// 	jQuery(".table-wrapper:has(.data)").on("click", ".add", function () {
// 		let last_tr = $("table.data tbody tr:last-child").clone();

// 		last_tr.find("td").each(function () {
// 			if ($(this).hasClass("locked")) {
// 				$(this).removeClass("locked");
// 			}
// 			if ($(this).hasClass("min-viewport")) {
// 				applyDefault($(this).find("span:not(.lock)"), config.min_vp);
// 			} else if ($(this).hasClass("max-viewport")) {
// 				applyDefault($(this).find("span:not(.lock)"), config.max_vp);
// 			} else if ($(this).hasClass("min-row-w")) {
// 				applyDefault($(this).find("span:not(.lock)"), config.min_row_w);
// 			} else if ($(this).hasClass("max-row-w")) {
// 				applyDefault($(this).find("span:not(.lock)"), config.max_row_w);
// 			} else {
// 				$(this).find("span").empty();
// 			}
// 		});

// 		last_tr.find(".element span").attr("contenteditable", "true");
// 		if (!last_tr.hasClass("custom-tr")) {
// 			last_tr.addClass("custom-tr");
// 		}
// 		last_tr.appendTo(".data tbody");
// 	});

// 	function pxToRem(px) {
// 		return parseFloat((px / 16).toFixed(4)) + "rem";
// 	}

// 	$('input[name="px-rem"], input[name=vw-cqi]').change(function () {
// 		const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
// 		if (jQuery(".custom-css .css").length > 0) {
// 			GenerateResults(vw_or_vwCQI);
// 		}
// 	});
	
// 	// $('input[name="vw-cqi"]').change(function () {
// 	// 	const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
// 	// 	if (jQuery(".custom-css .css").length > 0) {
// 	// 		GenerateResults(vw_or_vwCQI);
// 	// 	}
// 	// });

// 	jQuery(".generate").click(function () {
// 		const vw_or_vwCQI = jQuery("input[name=vw-cqi]:checked").val();
// 		GenerateResults(vw_or_vwCQI);
		
// 		// if (vw_or_vwCQI == 'vw-cqi') {
// 		// 	GenerateResults(vw_or_vwCQI);
// 		// } else {
// 		// 	GenerateResults();
// 		// }
		
// 	});

	
// 	function generateSlope(min_size, max_size, min_vp, max_vp) {
// 		return (max_size - min_size) / (max_vp - min_vp);
// 	}
	
	
// 	function GenerateResults(output_mode) {
		
		
// 		var resultText = "";
// 		var values_array = [];
		
// 		// console.log(output_mode);

// 		jQuery("tbody tr").each(function () {
// 			// var element = "";

// 			// var min_size = "";
// 			// var max_size = "";
// 			// var min_viewport = "";
// 			// var max_viewport = "";
// 			// var min_row_w = "";
// 			// var max_row_w = "";

// // 			V2
			
// 			let fields = {
// 				min_size: '.min-size',
// 				max_size: '.max-size',
// 				min_viewport: '.min-viewport',
// 				max_viewport: '.max-viewport',
// 				min_row_w: '.min-row-w',
// 				max_row_w: '.max-row-w'
// 		};

// 		let values = {};

// 		jQuery.each(fields, function(key, selector) {
// 				let text = jQuery(this).children(selector).text().trim();

// 				if (text.length) {
// 						values[key] = parseFloat(text);
// 				}
// 		}.bind(this)); // keep correct context
			
			
// 			// destructuring (cleaner)
// 			let {
// 					min_size,
// 					max_size,
// 					min_viewport,
// 					max_viewport,
// 					min_row_w,
// 					max_row_w
// 			} = values;
			
// // 			min_size = values.min_size;
// // 			max_size = values.max_size;
// // 			min_viewport = values.min_viewport;
// // 			max_viewport = values.max_viewport;
// // 			min_row_w = values.min_row_w;
// // 			max_row_w = values.max_row_w;
			
			
			
			
			
			

// 		// usage
// 		// console.log(values.min_size);
			
// 			// V1
// // 			if (jQuery(this).children(".min-size").text().length) {
// // 				min_size = parseFloat(jQuery(this).children(".min-size").text());
// // 			}

// // 			if (jQuery(this).children(".max-size").text().length) {
// // 				max_size = parseFloat(jQuery(this).children(".max-size").text());
// // 			}

// // 			if (jQuery(this).children(".min-viewport").text().length) {
// // 				min_viewport = parseFloat(jQuery(this).children(".min-viewport").text());
// // 			}

// // 			if (jQuery(this).children(".max-viewport").text().length) {
// // 				max_viewport = parseFloat(jQuery(this).children(".max-viewport").text());
// // 			}
			
// // 			if (jQuery(this).children(".min-row-w").text().length) {
// // 				min_row_w = parseFloat(jQuery(this).children(".min-row-w").text());
// // 			}
			
// // 			if (jQuery(this).children(".max-row-w").text().length) {
// // 				max_row_w = parseFloat(jQuery(this).children(".max-row-w").text());
// // 			}
			
			

// 			if (
// 				!isNaN(min_size) &&
// 				!isNaN(max_size) &&
// 				!isNaN(min_viewport) &&
// 				!isNaN(max_viewport) &&
// 				min_size !== "" &&
// 				max_size !== "" &&
// 				min_viewport !== "" &&
// 				max_viewport !== ""
// 			) {
// 				const px_or_rem = jQuery("input[name=px-rem]:checked").val();
				
				
// 				let min_clamp_size = min_size + "px";
// 				let max_clamp_size = max_size + "px";

// 				let heading = jQuery(this).children(".element").text();

// 				// const slope = (max_size - min_size) / (max_viewport - min_viewport);
// 				const slope = generateSlope(min_size, max_size, min_viewport, max_viewport)
				
				
				
				
				
				
// 				//const yAxisIntersection =  -min_viewport * slope + min_size;
// 				//const preferredFontSize = (yAxisIntersection / 16).toFixed(3) + 'rem + ' + (slope * 100 ).toFixed(3) + 'vw';
// 				//const clampValue = `clamp(${minFontSizeRem}, ${preferredFontSize}, ${maxFontSizeRem})`;

// 				const yAxisIntersection = min_size - slope * min_viewport;
// 				let preferredFontSizePxRem = parseFloat(yAxisIntersection.toFixed(3));

// 				if (px_or_rem == "rem") {
// 					min_clamp_size = pxToRem(min_size);
// 					max_clamp_size = pxToRem(max_size);
// 					preferredFontSizePxRem = pxToRem(preferredFontSizePxRem);
// 				} else {
// 					preferredFontSizePxRem = preferredFontSizePxRem + "px";
// 				}

// 				const preferredFontSizeVw = parseFloat((slope * 100).toFixed(4));
				
// 				let preferedUnit = output_mode == 'cqi' ? 'cqi' : 'vw';
// 				let preferredFontSizeOutput = `${preferredFontSizePxRem} + ${preferredFontSizeVw}${preferedUnit}`;
// 				// let preferredFontSizeOutput = `${preferredFontSizePxRem} + ${preferredFontSizeVw}vw`;
				
				
// 				console.log(jQuery('#generate-typescale').is(":checked"));
				
// 				if(output_mode == 'vw-cqi') {
// 				// if(output_mode == 'vw-cqi' && !jQuery('#generate-typescale').is(":checked")) {
// 					if(!isNaN(min_row_w) && !isNaN(max_row_w)) {
						
// 						let min_viewport_CQI = min_viewport * (min_row_w/100);
// 						let max_viewport_CQI = max_viewport * (max_row_w/100);

// 						const slopeCQI = generateSlope(min_size, max_size, min_viewport_CQI, max_viewport_CQI);
// 						const yAxisIntersection_for_CQI = min_size - slopeCQI * min_viewport_CQI;
// 						let preferredFontSizePxRem_for_CQI = parseFloat(yAxisIntersection_for_CQI.toFixed(3));
						
// 						if (px_or_rem == "rem") {
// 							preferredFontSizePxRem_for_CQI = pxToRem(preferredFontSizePxRem_for_CQI);
// 						} else {
// 							preferredFontSizePxRem_for_CQI = preferredFontSizePxRem_for_CQI + "px";
// 						}

// 						const preferredFontSizeCQI = parseFloat((slopeCQI * 100).toFixed(4));
// 						preferredFontSizeOutput = `min(${preferredFontSizePxRem_for_CQI} + ${preferredFontSizeCQI}cqi, ${preferredFontSizeOutput})`
						
						
// 					}
					
					
// 				} else if(output_mode == 'vw-cqi' && jQuery('#generate-typescale').is(":checked")) {
					
// // 					TODO Generate scale for clamp(min( "cqi" ))
					
// 					preferredFontSizeOutput = `min(10cqi, ${preferredFontSizeOutput})`
// 				}
				
				
// 				const clampValue = `clamp(${min_clamp_size}, ${preferredFontSizeOutput}, ${max_clamp_size})`;
// 				if(!jQuery('#generate-typescale').is(":checked")) {
// 					resultText = resultText + heading + " { font-size: " + clampValue + "; }";
// 				} else {
// 					resultText = resultText + '--fs-'+heading + "-main: " + clampValue + ";";
// 				 }
				
				

// 				values_array.push(heading + ", " + clampValue);

// 				if (resultText.length != 0) {
// 					resultText = resultText + "<br>";
// 				}
// 			}
// 		});

// 		$(".results tbody").empty();

// 		if (values_array.length) {
// 			// Styles for visualizer
			
// 			if(!jQuery('#generate-typescale').is(":checked")) {
// 				$("body style").text(
// 					resultText
// 						.replaceAll("<br>", "")
// 						.replace(/(h[1-6])(.*?)/g, "$1.custom-size$2")
// 					);
// 				} else {
// 					$("body style").text(':root{' + 
// 					resultText.replaceAll("<br>", "") + '}'
// 						// .replaceAll("<br>", "")
// 						// .replace(/(h[1-6])(.*?)/g, "$1:$2") + '}'
// 				);
					
// 					jQuery('#input-css').val(resultText.replaceAll("<br>", ""));
					
// 					document.getElementById('generate').click();
// 					updateFontSize()
// 					// generateScale;
// 			}
			
			
			

// 			$(".results-wrapper").show();
// 			$(".custom-css .css").html(':root{' + resultText + '}');

// 			for (let i = 0; i < values_array.length; ++i) {
// 				let element = values_array[i].substring(0, values_array[i].indexOf(", "));
// 				let value = values_array[i].substring(values_array[i].indexOf(", ") + 1);

// 				jQuery(".results tbody").append(
// 					'<tr><td class="element">' +
// 						element +
// 						'</td><td class="value">' +
// 						value +
// 						"</td></tr>"
// 				);
// 			}

// 			Notif("Generated");
// 		} else {
// 			$(".results-wrapper").hide();
// 		}
// 	}

// 	// Visibility output-inputs-wrap
	
// 	$('.output-inputs-wrap input').click(function(){
// 		let value = $(this).val();
// 		if (value == 'vw-cqi') {
// 			$('.min-row-w, .max-row-w').removeClass('hidden');
// 		} else {
// 			$('.min-row-w, .max-row-w').addClass('hidden');
// 		}
// 	});
	
	
// 	jQuery(".table-wrapper:has(.data)").on(
// 	"keypress",
// 	'[class*="min-"] span[contenteditable], [class*="max-"] span[contenteditable]',
// 	function (e) {
// 		if (isNaN(String.fromCharCode(e.which))) {
// 			e.preventDefault();
// 		}
// 	}
// );
	
	
// 	// 	Accordion

// 	$(".custom-css .title").click(function () {
// 		$(".custom-css .css").toggleClass("hidden visible");
// 		// $(".custom-css .css").slideToggle();
		
// 	});

// 	/* Copy */

// 	$(document).on(
// 		"click",
// 		".results tbody td.element, .results tbody td.value, .custom-css .css",
// 		function () {
// 			copyToClipboard($(this));
// 		}
// 	);

// 	function copyToClipboard(element) {
// 		var $temp = $("<input>");
// 		$("body").append($temp);

// 		// console.log($(element).text());

// 		$temp.val($(element).text().trim()).select();
// 		document.execCommand("copy");
// 		$temp.remove();
// 	}


	


// 	/* Lock */

// 	$(document).on("click", ".lock", function () {
// 		$(this).parent("td").toggleClass("locked");
// 	});

	
	
	
	
// 	/* Deconstruct */
// // clamp(20px, min(23.913px + -1.087cqi, 23.333px + -0.8333vw), 10px)
// 	$(".deconstruct").click(function () {
// 		// ex		clamp(20px, 5.789px + 3.1579vw, 50px)
// 		var clampValue = $(".clamp-value").text();
		
// 		let cqi = clampValue.includes('cqi');
// 		let matches = '';
		
// 		// let matches = clampValue.match(
// 		// 	/clamp\(([^,]+), ([^+]+) \+ ([^,]+), ([^)]+)\)/
// 		// );
		
// 		if (!cqi) {
// 			matches = clampValue.match(
// 			/clamp\(([^,]+), ([^+]+) \+ ([^,]+), ([^)]+)\)/
// 		);
// 		} else {
// 			matches = clampValue.match(
// 			/clamp\(([^,]+), min\(([^+]+) \+ ([^,]+), ([^+]+) \+ ([^)]+)\), ([^)]+)\)/
// 		);
// 		}
		
// 		// console.log(matches, cqi);
		
		
// 		const rootFontSize = 16;
// 		var unit = "px";

// 		if (matches) {
// 			const convertToPx = (value) => {
// 				if (value.includes("rem")) {
// 					// unit = 'rem';
// 					return parseFloat(value) * rootFontSize; // Convert rem to px
// 				}
// 				return parseFloat(value); // Already in px
// 			};

			
// 			let minValue = ''; // 1.25rem -> px
// 			let baseValue = ''; // 0.6579rem -> px
// 			let fluidValue = ''; // vw stays as-is
// 			let maxValue = ''; // 2.5rem -> px
			
// 			let baseValue2 = '';
// 			let fluidValue2 = ''; 
			
// 			let output_min_viewport = '';
// 			let output_max_viewport = '';
// 			let output_min_row_w = '';
// 			let output_max_row_w = '';
			
			
			
			
			
// 			if (!cqi) {
// 				// let minValue = matches[1].trim();
// 				// let baseValue = matches[2].trim();
// 				// let fluidValue = matches[3].trim();
// 				// let maxValue = matches[4].trim();
// 				minValue = convertToPx(matches[1].trim()); // 1.25rem -> px
// 				baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
// 				fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
// 				maxValue = convertToPx(matches[4].trim()); // 2.5rem -> px
// 			} else {
				
// 				minValue = convertToPx(matches[1].trim()); // 1.25rem -> px
// 				// baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
// 				// fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
				
// 				maxValue = convertToPx(matches[6].trim()); // 2.5rem -> px
				
				
				
// 				if (matches[3].trim().includes('vw')) {
// 					// console.log("vw");
// 					// vw
// 					baseValue = convertToPx(matches[2].trim()); // 0.6579rem -> px
// 					fluidValue = parseFloat(matches[3].trim()); // vw stays as-is
					
// 					//cqi
// 					baseValue2 = convertToPx(matches[4].trim()); // 0.6579rem -> px
// 					fluidValue2 = parseFloat(matches[5].trim()); // vw stays as-is
// 				} else {
// 					// console.log("cqi");
// 					// vw
// 					baseValue = convertToPx(matches[4].trim()); // 0.6579rem -> px
// 					fluidValue = parseFloat(matches[5].trim()); // vw stays as-is
					
// 					// cqi
// 					baseValue2 = convertToPx(matches[2].trim()); // 0.6579rem -> px
// 					fluidValue2 = parseFloat(matches[3].trim()); // vw stays as-is
// 				}
				
// 			}

// 			$(".deconstruct_min-size > span.value").text(minValue);
// 			$(".deconstruct_max-size > span.value").text(maxValue);

// 			// minValue = parseFloat(minValue); // 20px
// 			// baseValue = parseFloat(baseValue); // 5.789px
// 			// fluidValue = parseFloat(fluidValue); // 3.1579vw
// 			// maxValue = parseFloat(maxValue); // 50px

			
// 			let values_from_vw = get_min_max_from_values(baseValue, fluidValue, minValue, maxValue);
			
// 			// console.log(values_from_vw);
// 			const viewportAtMin = values_from_vw[0]; // in vw
// 			const viewportAtMax = values_from_vw[1]; // in vw
			
// 			// Calculate the viewports
// 			// const viewportAtMin = (minValue - baseValue) / fluidValue; // in vw
// 			// const viewportAtMax = (maxValue - baseValue) / fluidValue; // in vw

// 			// console.log(viewportAtMin);
// 			// clamp(21px, 10.867px + 2.5333vw, 59px)
			
// 			output_min_viewport = parseInt(Math.round(viewportAtMin * 100));
// 			output_max_viewport = parseInt(Math.round(viewportAtMax * 100));
			

// 			$(".deconstruct_min-viewport > span.value").text(
// 				output_min_viewport
// 			);
// 			$(".deconstruct_max-viewport > span.value").text(output_max_viewport);

// 			// $('.deconstruct_min-viewport > span.value').text(parseInt(viewportAtMin*100)) ;
// 			// $('.deconstruct_max-viewport > span.value').text(parseInt(viewportAtMax*100));
				
			
			
			
			
// 			if (cqi) {
// 				let values_from_cqi = get_min_max_from_values(baseValue2, fluidValue2, minValue, maxValue);
			
// 				// console.log(values_from_cqi);
// 				let widthAtMin = values_from_cqi[0]; // in vw
// 				let widthAtMax = values_from_cqi[1]; // in vw
				
				
// 				let min_row_w = parseInt(Math.round(widthAtMin * 100));
// 				let max_row_w = 	parseInt(Math.round(widthAtMax * 100));
				
// 				output_min_row_w = (min_row_w / output_min_viewport) * 100;
// 				output_max_row_w = (max_row_w / output_max_viewport) * 100;
				
				
// 				$(".deconstruct_min-row-w > span.value").text(output_min_row_w);
// 				$(".deconstruct_max-row-w > span.value").text(output_max_row_w);
				
// 				$(".deconstruct_min-row-w, .deconstruct_max-row-w").removeClass('hidden');
// 			} else {
// 				$(".deconstruct_min-row-w, .deconstruct_max-row-w").addClass('hidden');
// 			}
// 		}
// 	});

// 	function get_min_max_from_values(base, fluid, min, max) {
// 		let widthAtMin = (min - base) / fluid; // in vw
// 		let widthAtMax = (max - base) / fluid; // in vw
		
// 		return [widthAtMin, widthAtMax];
// 	}
	
// // 	Converter
// 	// $('.convert').click(function(){
// 	// 	let original = parseInt($('.converter .original').text());
// 	// 	let wanted = parseInt($('.converter .wanted').text());
		
// 	// 	$('.converter .em').text((wanted / original).toFixed(4).replace(/\.?0+$/, ''));
// 	// });


// 	$(document).on('input', '.converter .original, .converter .wanted', function() {		
// 		convertWantedToEm();
// 	});

// 	function convertWantedToEm() {
// 		let original = parseInt($('.converter .original').text());
// 		let wanted = parseInt($('.converter .wanted').text());

// 		if (!isNaN(original) && !isNaN(wanted)) {
// 			$('.converter .em').text((wanted / original).toFixed(4).replace(/\.?0+$/, ''));
// 		} else {
// 			$('.converter .em').text('');
// 		}
// 	}

	
	
	

// 	// 	Visualiser
	
// 	const visualizer_container = document.querySelector('.visualizer');
// 	const visualizer_tags = ['h1','h2','h3','h4','h5','h6'];

// 	const titleText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit.';
// 	const paragraphText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor eligendi unde, ipsa dolorum quos quaerat alias assumenda et ducimus. Vero, culpa nisi facere nostrum dicta accusamus. Praesentium ullam exercitationem atque iure et doloremque. Voluptatum exercitationem quaerat, inventore expedita assumenda corrupti ab praesentium quia corporis illum est magni aperiam natus blanditiis!';

// 	visualizer_tags.forEach(visualizer_tag => {
// 		const wrapper = document.createElement('div');

// 		const label = document.createElement('span');
// 		label.className = 'unit';
// 		label.textContent = visualizer_tag;

// 		const inner = document.createElement('div');

// 		const heading = document.createElement(visualizer_tag);
// 		heading.className = 'custom-size';
// 		heading.textContent = titleText;

// 		const p = document.createElement('p');
// 		p.className = 'custom-size hidden';
// 		p.textContent = paragraphText;

// 		inner.appendChild(heading);
// 		inner.appendChild(p);

// 		wrapper.appendChild(label);
// 		wrapper.appendChild(inner);

// 		visualizer_container.appendChild(wrapper);
// 	});
	
	
	
	
	
	
	
	
// 	$(".visualizer > div p").hide();

// 	$(".visualizer > div").click(function () {
// 		$(this).find("p").toggleClass("hidden visible");
// 		$(this).find("p").slideToggle();
// 	});

// 	// 	Navigation
// 	$(".navigation .page-toggle").click(function () {
// 		$(".page-toggle.active").not($(this)).removeClass("active");
// 		$(this).addClass("active");

// 		// Change page title
// 		var string = $(this).attr("data-page");
// 		var newString = string[0].toUpperCase() + string.slice(1);
// 		$(".page-title").text(newString);

// 		// Show page
// 		showPage($(this).data("page"));
// 	});

// 	function showPage(page) {
// 		$(".page.active")
// 			.not($('.page[data-page="' + page + '"]'))
// 			.removeClass("active");
// 		$('.page[data-page="' + page + '"]').addClass("active");
// 	}
	
	
	
	
	
	
	
	
	

	
	
// });









