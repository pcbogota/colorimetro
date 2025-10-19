const referenceColorBox = document.getElementById("refColor");
const referenceValues = document.getElementById("referenceValues");

const referenceSliders = {
	r: document.getElementById("Reference_rRange"),
	g: document.getElementById("Reference_gRange"),
	b: document.getElementById("Reference_bRange"),
};

const referenceNumbers = {
	r: document.getElementById("Reference_rValue"),
	g: document.getElementById("Reference_gValue"),
	b: document.getElementById("Reference_bValue"),
};

const sampleColorBox = document.getElementById("sampleColor");
const sampleValues = document.getElementById("sampleValues");

const SampleSliders = {
	r: document.getElementById("Sample_rRange"),
	g: document.getElementById("Sample_gRange"),
	b: document.getElementById("Sample_bRange"),
};

const sampleNumbers = {
	r: document.getElementById("Sample_rValue"),
	g: document.getElementById("Sample_gValue"),
	b: document.getElementById("Sample_bValue"),
};

const presets = document.querySelectorAll(".preset");
const colorPicker = document.getElementById("colorPicker");
const customBox = document.getElementById("customColor");

function rgbToHex(r, g, b) {
	return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0").toUpperCase()).join("");
}

function rgbToCmyk(r, g, b) {
	const c = 1 - r / 255;
	const m = 1 - g / 255;
	const y = 1 - b / 255;
	const k = Math.min(c, m, y);
	const denom = 1 - k || 1;
	return {
		c: Math.round(((c - k) / denom) * 100),
		m: Math.round(((m - k) / denom) * 100),
		y: Math.round(((y - k) / denom) * 100),
		k: Math.round(k * 100),
	};
}

function updateColor(r, g, b, box, values) {
	const hex = rgbToHex(r, g, b);
	const cmyk = rgbToCmyk(r, g, b);

	box.style.background = hex;
	values.innerHTML = `
			    <div><span>RGB:</span> (${r}, ${g}, ${b})</div>
			    <div><span>CMYK:</span> (${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})</div>
			    <div><span>HEX:</span> ${hex}</div>
			  `;
	if (box == sampleColorBox) {
		presets.forEach((p) => {
			p.classList.toggle("active", p.dataset.color?.toUpperCase() === hex);
		});
	}
}

function syncInputs(channel, value, sliders, box, numbers, values) {
	sliders[channel].value = value;
	numbers[channel].value = value;
	updateColor(parseInt(numbers.r.value), parseInt(numbers.g.value), parseInt(numbers.b.value), box, values);
}

Object.keys(SampleSliders).forEach((ch) => {
	SampleSliders[ch].addEventListener("input", (e) =>
		syncInputs(ch, e.target.value, SampleSliders, sampleColorBox, sampleNumbers, sampleValues)
	);
	sampleNumbers[ch].addEventListener("input", (e) => {
		let v = Math.min(255, Math.max(0, e.target.value || 0));
		syncInputs(ch, v, SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
	});
});

Object.keys(referenceSliders).forEach((ch) => {
	referenceSliders[ch].addEventListener("input", (e) =>
		syncInputs(ch, e.target.value, referenceSliders, referenceColorBox, referenceNumbers, referenceValues)
	);
	referenceNumbers[ch].addEventListener("input", (e) => {
		let v = Math.min(255, Math.max(0, e.target.value || 0));
		syncInputs(ch, v, referenceSliders, referenceColorBox, referenceNumbers, referenceValues);
	});
});

presets.forEach((p) => {
	p.style.background = p.dataset.color;
	p.addEventListener("click", () => {
		presets.forEach((x) => x.classList.remove("active"));
		p.classList.add("active");
		if (p.classList.contains("custom")) {
			colorPicker.click();
		} else {
			const hex = p.dataset.color;
			const bigint = parseInt(hex.substring(1), 16);
			const r = (bigint >> 16) & 255;
			const g = (bigint >> 8) & 255;
			const b = bigint & 255;
			syncInputs("r", r, SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
			syncInputs("g", g, SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
			syncInputs("b", b, SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
		}
	});
});

colorPicker.addEventListener("input", (e) => {
	const color = e.target.value.toUpperCase();
	customBox.style.background = color;
	customBox.dataset.color = color;
	syncInputs("r", parseInt(color.slice(1, 3), 16), SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
	syncInputs("g", parseInt(color.slice(3, 5), 16), SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
	syncInputs("b", parseInt(color.slice(5, 7), 16), SampleSliders, sampleColorBox, sampleNumbers, sampleValues);
});

updateColor(255, 0, 0, sampleColorBox, sampleValues);
