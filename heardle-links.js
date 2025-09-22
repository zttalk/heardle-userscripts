// ==UserScript==
// @name         Heardle Links
// @description  Adds links to YouTube and lyrics to the solution page.
// @version      1.0.1
// @namespace    https://github.com/zttalk/
// @updateURL    https://github.com/zttalk/heardle-userscripts/raw/main/heardle-links.user.js
// @match        https://*.heardledecades.com/
// @match        https://*.heardledecades.xyz/
// @match        https://*.heardlegames.xyz/
// @match        https://heardle80s.com/
// @match        https://reheardle.xyz/
// @grant        none
// ==/UserScript==

"use strict";

let done = false;

function createLink(url, innerHTML) {
	const a = document.createElement("a");
	a.target = "_blank";
	a.rel = "noreferrer";
	a.className = "py-2 px-3 rounded-lg";
	a.style.backgroundColor = "#48f";
	a.href = url;
	a.innerHTML = innerHTML;
	return a;
}

function findSolution(context) {
	if (done) {
		return true;
	}
	let e = context.querySelector("div.p-2.rounded-sm.bg-custom-mg > div.flex-1.mx-3.text-white");
	if (!e) {
		e = context.querySelector("div.p-2.rounded-sm.bg-custom-positive > div.flex-1.mx-3.text-white");
	}
	if (!e) {
		return false;
	}
	e = e.parentNode.parentNode;
	if (e.tagName === "A") {
		e = e.parentNode;
	}
	const solution = e.innerText.replace(/\s+/g, " ").trim();
	if (solution === "") {
		// This tends to happen when reloading an already solved Heardle.
		console.warn("Found empty solution element.", e);
		setTimeout(function() { findSolution(context); }, 1000);
		return false;
	}
	console.log("Found solution:", e, solution);
	const linkYoutube = createLink(`https://duckduckgo.com/?q=!+youtube+${encodeURIComponent(solution).replace(/%20/g, "+")}&ia=web`, "YouTube");
	const linkLyrics  = createLink(`https://duckduckgo.com/?q=!+lyrics+${ encodeURIComponent(solution).replace(/%20/g, "+")}&ia=web`, "Lyrics" );
	const divLinks = document.createElement("div");
	divLinks.style.textAlign = "center";
	divLinks.append(linkYoutube);
	divLinks.append(document.createTextNode(" · "));
	divLinks.append(linkLyrics);
	e.insertAdjacentElement("afterend", divLinks);
	done = true;
	return true;
}

if (!findSolution(document.body)) {
	const obs = new MutationObserver(function (mutations) {
		for (const mutation of mutations) {
			for (const addedNode of mutation.addedNodes) {
				if (findSolution(addedNode.parentNode)) {
					obs.disconnect();
					return;
				}
			}
		}
	});
	obs.observe(document.body, {childList: true, subtree: true});
}
