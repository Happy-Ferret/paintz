'use strict';

/**
 * Create a new FloodFillTool instance.
 * @param {CanvasRenderingContext2D} cxt - The canvas context in which the image is shown
 * @param {CanvasRenderingContext2D} preCxt - The canvas context in which the drawing previews are shown
 */
function FloodFillTool(cxt, preCxt) {
	Tool.apply(this, arguments);
}

FloodFillTool.prototype = Object.create(Tool.prototype);


/**
 * Fill the canvas, starting at (startX,startY).
 * @param {Number} startX - The x-coordinate of the fill's starting point
 * @param {Number} startY - The y-coordinate of the fill's starting point
 */
FloodFillTool.prototype._fill = function (startX, startY) {
	if (this._filling) {
		return;
	}
	
	this._filling = true;
	
	// Get the pixel data.
	this._imageData = this._cxt.getImageData(0, 0, this._cxt.canvas.width, this._cxt.canvas.height);
	// Get the starting position and add it to the stack.
	var pixelPos = (startY * this._imageData.width + startX) * 4,
		pixelStack = [[startX, startY]];
	// Get the color of the clicked pixel.
	this._startColor = {
		r: this._imageData.data[pixelPos],
		g: this._imageData.data[pixelPos + 1],
		b: this._imageData.data[pixelPos + 2]
	};
	
	// Quit if the clicked pixel is already the correct color.
	if (this._fillColor.r === this._startColor.r &&
			this._fillColor.g === this._startColor.g &&
			this._fillColor.b === this._startColor.b) {
		this._filling = false;
		return;
	}
	
	while (pixelStack.length > 0) {
		var pos = pixelStack.pop(),
			x = pos[0],
			y = pos[1];
		
		pixelPos = (y * this._imageData.width + x) * 4;
		while (y-- >= 0 && this._checkColorMatch(pixelPos)) {
			pixelPos -= this._imageData.width * 4;
		}
		pixelPos += this._imageData.width * 4;
		y++;
		
		var rightPixel = false,
			leftPixel = false;
		while (y++ < this._imageData.height - 1 && this._checkColorMatch(pixelPos)) {
			this._colorPixel(pixelPos);
			if (x > 0) {
				if (this._checkColorMatch(pixelPos - 4)) {
					if (!leftPixel) {
						pixelStack.push([x - 1, y]);
						leftPixel = true;
					}
				} else {
					leftPixel = false;
				}
			}
			if (x < this._imageData.width - 1) {
				if (this._checkColorMatch(pixelPos + 4)) {
					if (!rightPixel) {
						pixelStack.push([x + 1, y]);
						rightPixel = true;
					}
				} else {
					rightPixel = false;
				}
			}
			pixelPos += canvas.width * 4;
		}
	}
	
	this._cxt.putImageData(this._imageData, 0, 0);
	
	this._filling = false;
};

/**
 * Check whether the pixel at a given position as the same color as the first pixel clicked.
 * @param {Number} pixelPos - The index of the pixel to be checked in the image data array
 * @returns {Boolean}
 */
FloodFillTool.prototype._checkColorMatch = function (pixelPos) {
	var r = this._imageData.data[pixelPos],
		g = this._imageData.data[pixelPos + 1],
		b = this._imageData.data[pixelPos + 2];

	if (r === this._startColor.r &&
			g === this._startColor.g &&
			b === this._startColor.b) {
		return true;
	}
	return false;
};

/**
 * Change the color of a given pixel to the filling color.
 * @param {Number} pixelPos - The index of the pixel to be colored in the image data array
 */
FloodFillTool.prototype._colorPixel = function (pixelPos) {
	this._imageData.data[pixelPos] = this._fillColor.r;
	this._imageData.data[pixelPos + 1] = this._fillColor.g;
	this._imageData.data[pixelPos + 2] = this._fillColor.b;
};

/**
 * Convert a CSS color to RGB values.
 * @param {String} cssColor - The CSS color to parse
 * @returns {Object} - A map of `r`, `g`, and `b` to their number values
 */
FloodFillTool.prototype._colorToRGB = function (cssColor) {
	if (cssColor.charAt(0) === '#') {
		var result = (/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i).exec(cssColor);
		if (result) {
			return {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16)
			};
		}
	}
	return {
		black: {r: 0, g: 0, b: 0},
		blue: {r: 0, g: 0, b: 255},
		brown: {r: 165, g: 42, b: 42},
		cyan: {r: 0, g: 255, b: 255},
		gray: {r: 128, g: 128, b: 128},
		green: {r: 0, g: 128, b: 0},
		indigo : {r: 75, g: 0, b: 130},
		lightblue: {r: 173, g: 216, b: 230},
		lime: {r: 0, g: 255, b: 0},
		magenta: {r: 255, g: 0, b: 255},
		navy: {r: 0, g: 0, b: 128},
		olive: {r: 128, g: 128, b: 0},
		orange: {r: 255, g: 165, b: 0},
		purple: {r: 128, g: 0, b: 128},
		red: {r: 255, g: 0, b: 0},
		teal: {r: 0, g: 128, b: 128},
		violet: {r: 238, g: 130, b: 238},
		white: {r: 255, g: 255, b: 255},
		yellow: {r: 255, g: 255, b: 0}
	}[cssColor];
};

/**
 * Handle the flood fill tool becoming the active tool.
 * @override
 */
FloodFillTool.prototype.activate = function () {
	this._filling = false;
	this._imageData = [];
	this._startColor = {};

	
	this._preCxt.canvas.style.cursor = 'url(images/cursors/paint_bucket.png) 3 15, default';
};

/**
 * Handle the flood fill being activated by a pointer.
 * @override
 * @param {Object} pointerState - The pointer coordinates and button
 */
FloodFillTool.prototype.start = function (pointerState) {
	if (pointerState.button !== 2) {
		this._fillColor = this._colorToRGB(localStorage.lineColor);
	} else {
		this._fillColor = this._colorToRGB(localStorage.fillColor);
	}
	
	this._fill(pointerState.x, pointerState.y);
	undoStack.addState();
};
