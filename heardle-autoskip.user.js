// ==UserScript==
// @name       Heardle Auto-Skip
// @version    1.0.0
// @namespace  https://github.com/zttalk/
// @updateURL  https://github.com/zttalk/heardle-userscripts/raw/main/heardle-autoskip.user.js
// @match      https://*.heardledecades.com/
// @match      https://*.heardledecades.xyz/
// @match      https://*.heardlegames.xyz/
// @match      https://heardle80s.com/
// @match      https://reheardle.xyz/
// @grant      none
// ==/UserScript==

let bar;
let recentProgress = [];
let wasClose = false;
let statusElement;
let autoSkipping = true;

function findSkipButton() {
	return document.querySelector(".flex.justify-between > button");
}

const obsLoad = new MutationObserver(function (mutations) {
	for (const mutation of mutations) {
		for (const addedNode of mutation.addedNodes) {
			if (!("querySelector" in addedNode)) {
				continue
			}
			bar = addedNode.parentNode?.querySelector(".h-3")?.childNodes[0]?.childNodes[0];
			if (bar) {
				console.log("Found bar.", bar);
				obsLoad.disconnect();
				
				const playButton = document.querySelector(".border-t.border-custom-line .justify-center > button");
				if (!playButton) {
					console.error("Could not find play button.");
					return;
				}
				console.debug("Found play button.", playButton);
				
				const skipButton = findSkipButton();
				if (!skipButton) {
					console.error("Could not find skip button.");
					return;
				}
				console.debug("Found skip button.", skipButton);
				
				skipButton.style.display = "none";
				statusElement = document.createElement("span");
				statusElement.innerText = "Auto-skip enabled";
				skipButton.parentNode.insertBefore(statusElement, skipButton);
				
				playButton.addEventListener("click", function(e) {
					autoSkipping = true;
					statusElement.innerText = "Auto-skip enabled";
				});
				
				document.querySelector(".modal-background button")?.click();
				playButton.focus();
				
				obsProgress.observe(bar, {attributeFilter: ["style"]});
				return;
			}
		}
	}
});
obsLoad.observe(document, {childList: true, subtree: true});

const obsProgress = new MutationObserver(function (mutations) {
	const m = bar.style.width.match(/^(\d*\.?\d+)%$/);
	if (!m) {
		console.error("Cannot parse progress", bar, bar.style.width);
		obsProgress.disconnect();
		return;
	}
	const progress = parseFloat(m[1]) / 100.0;
	recentProgress.push(progress);
	if (recentProgress.length < 4) {
		return;
	}
	const oldProgress = recentProgress.shift();
	const isClose = 1.0 - progress < progress - oldProgress;
	if (!wasClose && isClose && autoSkipping) {
		console.debug("Getting close", oldProgress, recentProgress);
		const skipButton = findSkipButton();
		if (skipButton) {
			console.log("Skipping...", skipButton);
			skipButton.click();
		}
	}
	wasClose = isClose;
});

document.addEventListener("keydown", function(e) {
	if (!e.ctrlKey && ["PageUp", "PageDown"].includes(e.code)) {
		e.stopImmediatePropagation();
		e.preventDefault();
		if (autoSkipping && statusElement) {
			autoSkipping = false;
			statusElement.innerText = "Auto-skip disabled";
			document.getElementsByTagName("input")[0]?.focus();
		}
	}
}, {capture: true});
