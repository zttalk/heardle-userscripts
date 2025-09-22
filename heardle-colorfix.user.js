// ==UserScript==
// @name         Heardle Color Fix
// @description  Ensures the "middle" color's brightness is below a certain threshold.
// @version      1.0.0
// @namespace    https://github.com/zttalk/
// @updateURL    https://github.com/zttalk/heardle-userscripts/raw/main/heardle-colorfix.user.js
// @match        https://*.heardledecades.com/
// @match        https://*.heardledecades.xyz/
// @match        https://*.heardlegames.xyz/
// @match        https://heardle80s.com/
// @match        https://reheardle.xyz/
// @grant        none
// ==/UserScript==

"use strict";

const maxWhitenessMg = 0.4;

function parseColorVariable(cvarname) {
	const val = getComputedStyle(document.body).getPropertyValue(cvarname);
	if (!val.match(/^#[0-9a-f]{6}$/i)) {
		console.error(`Unexpected value for ${cvarname}: ${val}`);
		return;
	}
	return [
		parseInt(val.substr(1, 2), 16),
		parseInt(val.substr(3, 2), 16),
		parseInt(val.substr(5, 2), 16),
	];
}

let newValues = "";

const colorMg = parseColorVariable("--color-mg");
if (colorMg) {
	const whiteness = (colorMg[0] + colorMg[1] + colorMg[2]) / 3 / 255;
	console.log(`Determined colorMg to be ${colorMg} and have whiteness ${whiteness.toFixed(2)}.`);
	if (whiteness > maxWhitenessMg) {
		const newColor = [
			Math.round(colorMg[0] / whiteness * maxWhitenessMg),
			Math.round(colorMg[1] / whiteness * maxWhitenessMg),
			Math.round(colorMg[2] / whiteness * maxWhitenessMg),
		];
		newValues += `--color-mg: rgb(${newColor.join(" ")});`;
	}
}

if (newValues) {
	const style = document.createElement("style");
	document.head.appendChild(style);
	style.sheet.insertRule(`:root { ${newValues} }`);
	console.log("Updated color variables:", newValues);
}
