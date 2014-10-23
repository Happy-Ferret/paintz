'use strict';

var Utils = {
	DIALOG_TRANSITION_DURATION: 200, // In milliseconds.
	
	/**
	 * Get the x-coordinate of a click within the canvas.
	 * @param {Number} pageX - The x-coordinate relative to the page
	 */
	getCanvasX: function (pageX) {
		return pageX - preCanvas.offsetLeft;
	},
	
	/**
	 * Get the y-coordinate of a click within the canvas.
	 * @param {Number} pageY - The y-coordinate relative to the page
	 */
	getCanvasY: function (pageY) {
		return pageY - preCanvas.offsetTop;
	},
	
	/**
	 * Add dialog box functions to an element
	 * @param {HTMLElement} element - The dialog's HTML element
	 */
	makeDialog: function (element) {
		element.open = function () {
			element.classList.add('visible');
			setTimeout(function () {
				element.classList.add('open');
				// Focus the first form element in the dialog.
				element.querySelectorAll('button, input, select, textarea')[0].focus();
			}, 1);
		};
		element.close = function (e) {
			if (e && e.preventDefault) {
				e.preventDefault();
			}
			element.classList.remove('open');
			// After the closing animation has completed, hide the dialog box element completely.
			setTimeout(function () {
				element.classList.remove('visible');
			}, Utils.DIALOG_TRANSITION_DURATION);
		};
		if (element instanceof HTMLFormElement) {
			element.onsubmit = function (e) {
				e.target.close();
			};
		}
	},
	
	/**
	 * A shim for supporting requestAnimationFrame in older browsers.
	 * Inspired by Paul Irish.
	 */
	raf: (requestAnimationFrame ||
		webkitRequestAnimationFrame ||
		mozRequestAnimationFrame ||
		msRequestAnimationFrame ||
		oRequestAnimationFrame ||
		(function (func) {
			setTimeout(func, 1000 / 60);
		})).bind(window)
};
