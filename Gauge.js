/*
	   Copyright 2012 Janet Hollier

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

function Gauge(canvas, gaugeSettings) {

	/******* gaugeSettings properties:  **************************

	// inputGranularity is the smallest unit in which the input level is specified. 
	// Input must be provided as a value within the range of the outer scale and at a granularity that can be less than 
	//    but not greater than the smallest indicator interval shown on the outer scale.
	// inputGranularity should be a number in the range: 0 < inputGranularity <= 1.  
	gaugeSettings = {
		inputGranularity : 1,
		titleLine1 : "",
		titleLine2 : "",
		titleFont : "18pt Arial",
		gaugeDiam : 175,
		rimWidth : 25,
		faceColor : "white",
		centerX : 200,
		centerY : 250,
		startDegree : 135,
		endDegree : 405,
		outerScaleDiam : 100,
		outerScaleRange : {s: 0, e: 6000},
		outerScaleIntervals : [500,100,0],
		outerScaleFnt : "8pt Calibri",
		outerScaleColor : "black",
		outerScaleUnit : "PSI",
		hasInnerScale : false,
		innerScaleConvFactor : 0.068573,
		innerScaleDiam : 96,
		innerScaleStartLabel : 0,
		innerScaleIntervals : [50,10,0],
		innerScaleFnt : "8pt Arial",
		innerScaleColor : "red",
		innerScaleUnit : "Kg/cm3",
		innerScaleToEnd : true,
		dialBaseDiam : 25,
		pointerColor : "blue",
		digWd : 60,
		digHt : 14,
		digFnt : "12pt Calibri",
		digBC : "#efefef"
	}
	**************************************************************/

	// id of canvas on which gauge is to be drawn
	this.canvasId = canvas;

	// lookup table index associated with the current input level of gauge
	this.index = 0;

	// inputGranularity is the smallest unit in which the input level is specified. 
	// Input must be provided as a value within the range of the outer scale and at a granularity that can be less than 
	//    but not greater than the smallest indicator interval shown on the outer scale.
	// inputGranularity should be a number in the range: 0 < inputGranularity <= 1.  

	this.inputGranularity = (gaugeSettings.hasOwnProperty("inputGranularity")) ? gaugeSettings.inputGranularity : 1;
	if (this.inputGranularity > 1 || this.inputGranularity <= 0) this.inputGranularity = 1;
	
	//***** gauge title properties  *****// 
	this.gaugeNameLn1 = (gaugeSettings.hasOwnProperty("titleLine1")) ? gaugeSettings.titleLine1 : "";
	this.gaugeNameLn2 = (gaugeSettings.hasOwnProperty("titleLine2")) ? gaugeSettings.titleLine2 : "";
	this.gaugeNmFnt = (gaugeSettings.hasOwnProperty("titleFont")) ? gaugeSettings.titleFont : "18pt Arial";

	//***** gauge border and background properties  *****// 
	this.gaugeDiam = (gaugeSettings.hasOwnProperty("gaugeDiam")) ? gaugeSettings.gaugeDiam : 175;
	this.rimWidth = (gaugeSettings.hasOwnProperty("rimWidth")) ? gaugeSettings.rimWidth : 25;
	this.faceColor = (gaugeSettings.hasOwnProperty("faceColor")) ? gaugeSettings.faceColor : "white";	

	//***** centerpoint of gauge  *****// 
	this.centerX = (gaugeSettings.hasOwnProperty("centerX")) ? gaugeSettings.centerX : 200;
	this.centerY = (gaugeSettings.hasOwnProperty("centerY")) ? gaugeSettings.centerY : 250;

	//***** start and finish degrees of scale  *****// 
	this.startDegree = (gaugeSettings.hasOwnProperty("startDegree")) ? gaugeSettings.startDegree : 135;
	this.endDegree = (gaugeSettings.hasOwnProperty("endDegree")) ? gaugeSettings.endDegree : 405;
	this.startRadian = this.startDegree * (Math.PI/180);
	this.endRadian = this.endDegree * (Math.PI/180);

	//***** major scale properties  *****//
	this.outerScaleDiam = (gaugeSettings.hasOwnProperty("outerScaleDiam")) ? gaugeSettings.outerScaleDiam : 100;

	// first and last values (numbers) shown on the scale
	this.outerScaleRange = (gaugeSettings.hasOwnProperty("outerScaleRange")) ? gaugeSettings.outerScaleRange : {s: 0, e: 6000};

	// interval = # of units between scale's major, minor and subminor indicator marks (set an interval to 0 if not applicable)
	this.outerScaleIntervals = (gaugeSettings.hasOwnProperty("outerScaleIntervals")) ? gaugeSettings.outerScaleIntervals : [500,100,0];

	this.outerScaleFnt = (gaugeSettings.hasOwnProperty("outerScaleFnt")) ? gaugeSettings.outerScaleFnt : "8pt Calibri";
	this.outerScaleColor = (gaugeSettings.hasOwnProperty("outerScaleColor")) ? gaugeSettings.outerScaleColor : "black";
	this.outerScaleUnit = (gaugeSettings.hasOwnProperty("outerScaleUnit")) ? gaugeSettings.outerScaleUnit : "PSI";

	//***** minor scale properties  *****//
	// include inner scale?
	this.hasInnerScale = (gaugeSettings.hasOwnProperty("hasInnerScale")) ? gaugeSettings.hasInnerScale : false;

	// decimal number to multiply outer scale value by to get equivalent inner scale value (for determining step intervals for marking inner scale indicators)
	this.innerScaleConvFactor = (gaugeSettings.hasOwnProperty("innerScaleConvFactor")) ? gaugeSettings.innerScaleConvFactor : 0.068573;
	
	this.innerScaleDiam = (gaugeSettings.hasOwnProperty("innerScaleDiam")) ? gaugeSettings.innerScaleDiam : 96;

	// start labeling major indicator marks at this number
	this.innerScaleStartLabel = (gaugeSettings.hasOwnProperty("innerScaleStartLabel")) ? gaugeSettings.innerScaleStartLabel : 0;

	// interval = # of units between scale's major, minor and subminor indicator marks (set an interval to 0 if not applicable)
	this.innerScaleIntervals = (gaugeSettings.hasOwnProperty("innerScaleIntervals")) ? gaugeSettings.innerScaleIntervals : [50,10,0];

	this.innerScaleFnt = (gaugeSettings.hasOwnProperty("innerScaleFnt")) ? gaugeSettings.innerScaleFnt : "8pt Arial";
	this.innerScaleColor = (gaugeSettings.hasOwnProperty("innerScaleColor")) ? gaugeSettings.innerScaleColor : "red";
	this.innerScaleUnit = (gaugeSettings.hasOwnProperty("innerScaleUnit")) ? gaugeSettings.innerScaleUnit : "Kg/cm3";

	// if end of range is before end of outer scale's range, should additional tick markings be shown?
	this.innerScaleToEnd = (gaugeSettings.hasOwnProperty("innerScaleToEnd")) ? gaugeSettings.innerScaleToEnd : true;

	//***** dial base/center circle properties  *****//
	this.dialBaseDiam = (gaugeSettings.hasOwnProperty("dialBaseDiam")) ? gaugeSettings.dialBaseDiam : 25;
	
	//***** pointer properties  *****//
	this.pointerColor = (gaugeSettings.hasOwnProperty("pointerColor")) ? gaugeSettings.pointerColor : "blue";
	
	//***** conversions, lookups, max settings  *****//
	this.maxSteps = ((this.outerScaleRange.e - this.outerScaleRange.s) / this.inputGranularity) + 1;
	this.lookupTbl = createLookupTbl(this.startRadian, this.endRadian, this.maxSteps);
	this.innerStepConvRate = this.maxSteps / ((this.outerScaleRange.e * this.innerScaleConvFactor) - (this.outerScaleRange.s * this.innerScaleConvFactor));

	//***** digital display properties  *****//
	this.digWd = (gaugeSettings.hasOwnProperty("digWd")) ? gaugeSettings.digWd : 60; 
	this.digHt = (gaugeSettings.hasOwnProperty("digHt")) ? gaugeSettings.digHt : 14;
	this.digFnt = (gaugeSettings.hasOwnProperty("digFnt")) ? gaugeSettings.digFnt : "12pt Calibri";
	this.digBC = (gaugeSettings.hasOwnProperty("digBC")) ? gaugeSettings.digBC : "#efefef";
	this.digDispX = this.centerX - (this.digWd / 2);  
	this.digDispY = this.centerY + this.outerScaleDiam + (this.digHt / 2); 
	this.maxDigits = Math.floor(this.outerScaleRange.e).toString().length;
	this.digDispFixed = 0;
	if (this.inputGranularity < 1) {
		// add digits for decimal and 1 - 3 decimals
		var decs = this.inputGranularity.toFixed(3).toString(), addTo = 2;
		if (decs.substr(decs.length - 1,1) == "0") {
			addTo++;
			if (decs.substr(decs.length - 2,1) == "0") addTo++;
		}
		this.maxDigits += addTo;
		this.digDispFixed = addTo - 1;
	}

	//***** font sizes for spacing calculations  *****//
	this.gaugeNmFS = parseInt(this.gaugeNmFnt.replace(/[^0-9 ]/g, ""));
	if (!this.gaugeNmFS) this.gaugeNmFS = 18;

	this.outerScaleFS = parseInt(this.outerScaleFnt.replace(/[^0-9 ]/g, ""));
	if (!this.outerScaleFS) this.outerScaleFS = 8;

	this.innerScaleFS = parseInt(this.innerScaleFnt.replace(/[^0-9 ]/g, ""));
	if (!this.innerScaleFS) this.innerScaleFS = 8;
	
	this.digFS = parseInt(this.digFnt.replace(/[^0-9 ]/g, ""));
	if (!this.digFS) this.digFS = 12;

	//***** unit label positions *****//
	this.gap = ((this.centerY + this.outerScaleDiam) - (this.centerY + this.dialBaseDiam) - ((this.outerScaleFS + this.innerScaleFS) * 1.25)) / 7;
	this.minorUnitY = this.centerY + this.dialBaseDiam + (this.gap * 3);
	this.majorUnitY = this.minorUnitY + this.innerScaleFS + this.gap;

	// current input level
	this.inputLevel = this.outerScaleRange.s;

	return this;
}


function canvasSupport(canvas) {
	if (!canvas || !canvas.getContext) return false;
	return true;
}

function createLookupTbl(startRad, endRad, steps) {
	// assume all parameters are positive -- validation to be added
	var table = [],
		ang = startRad,
		angStep = (endRad - startRad) / steps;
	for (var i = 0; i <= steps; i++) {
		table[i] = [Math.cos(ang),Math.sin(ang)];
		ang += angStep;
	}
	return table;
}

function writeMessage(context, text, fnt, color, a, baseln, x, y) {
	context.textBaseline = baseln;
	context.textAlign = a;
	context.font = fnt;
	context.fillStyle = color;
	context.fillText(text, x, y);
}

function drawArc(context, x, y, d, startRad, endRad, cc, color, w) {
	context.beginPath();
	context.strokeStyle = color;
	context.lineWidth = w;
	context.arc(x, y, d, startRad, endRad, cc);
	context.stroke();
	context.closePath();
}

function drawTickMark(context, cos, sin, d1, d2, cX, cY) {
	var x, y;
	context.beginPath();
	x = cX + (cos * d1);
	y = cY + (sin * d1);
	context.moveTo(x, y);
	x = cX + (cos * d2);
	y = cY + (sin * d2);
	context.lineTo(x, y);
	context.stroke();
	context.closePath();
}

function labelStep(context, angle, lbl, radius, cX, cY, color, fnt) {
	context.setTransform(1,0,0,1,0,0);
	context.font = fnt;
	context.fillStyle = color;
	context.translate(cX, cY);
	context.rotate(angle + (Math.PI / 2));
	context.textAlign = "center";
	context.translate(0, -1 * radius);
	context.fillText(lbl, 0, 0);
	context.rotate(0);
	context.setTransform(1,0,0,1,0,0);
}
		
function drawOuterSteps(context, table, d1, d2, cX, cY, color, w, interval, granularity, label, lblFnt, startRad, endRad, firstLabel) {
	if (typeof label === "undefined") label = false;
	var last, 
		skipSteps = interval / granularity,
		totRadians = endRad - startRad;
	context.strokeStyle = color;
	context.lineWidth = w;

	for (var i = 0; i < table.length; i = i + skipSteps) {
		drawTickMark(context, table[i][0], table[i][1], d1, d2, cX, cY);
		if (label) {
			var lbl = ((i * granularity) + firstLabel).toString(),
				angle = startRad + (totRadians * (i / table.length));
			labelStep(context, angle, lbl, d2 + 15, cX, cY, color, lblFnt);
		}
		last = i;
	}
	if (last < table.length - 1) {
		// draw closing step
		drawTickMark(context, table[table.length - 1][0], table[table.length - 1][1], d1, d2, cX, cY);
	}
}

function drawInnerSteps(context, table, d1, d2, cX, cY, color, w, interval, firstLabel, innerStart, innerEnd, toEnd, label, lblFnt, startRad, endRad) {
	if (typeof label === "undefined") label = false;
	context.strokeStyle = color;
	context.lineWidth = w;

	var totUnits = innerEnd - innerStart,
		last = innerEnd, 
		idx = 0,
		totRadians = endRad - startRad;
	if (toEnd && innerStart != firstLabel) {
		// draw tick at beginning of arc
		drawTickMark(context, table[idx][0], table[idx][1], d1, d2, cX, cY);
	}
	for (var i = firstLabel; i <= innerEnd; i = i + interval) {
		idx = Math.floor((((i - innerStart )/ totUnits) * table.length) + 0.5);
		if (idx < 0) idx = 0;
		if (idx >= table.length) idx = table.length - 1;
		drawTickMark(context, table[idx][0], table[idx][1], d1, d2, cX, cY);
		if (label) {
			var angle = startRad + (totRadians * ((i - firstLabel) / totUnits));
			labelStep(context, angle, i.toString(), d2 - 2, cX, cY, color, lblFnt);
		}
		last = i;
	}
	if (toEnd && last < innerEnd) {
		// draw tick at end of arc
		idx = table.length - 1;
		drawTickMark(context, table[idx][0], table[idx][1], d1, d2, cX, cY);
	}
}

// prototype method of Gauge class so all Gauge properties are available -- as long as they are called using "this." qualifier
Gauge.prototype.drawScreen = function() {

	var theCanvas = document.getElementById(this.canvasId);
	if (!canvasSupport(theCanvas)) return;
	var context = theCanvas.getContext("2d");
		
	var w = theCanvas.width,
		h = theCanvas.height;

	context.clearRect(0,0,w,h);

	// name of gauge
	writeMessage(context, this.gaugeNameLn1, this.gaugeNmFnt, "black", "center", "top", this.centerX, 10);
	writeMessage(context, this.gaugeNameLn2, this.gaugeNmFnt, "black", "center", "top", this.centerX, 10 + this.gaugeNmFS * 1.25);

	// outer black circle
	drawArc(context, this.centerX, this.centerY, this.gaugeDiam, 0, 2*Math.PI, false, "#030303", 0.5);

    // add radial gradient for lighting effect
	var grd = context.createRadialGradient(this.centerX, this.centerY, this.gaugeDiam-2, this.centerX, this.centerY, this.gaugeDiam * 0.75);
	grd.addColorStop(0, "#222222");
	grd.addColorStop(0.2, "#787878");
	grd.addColorStop(0.4, "#222222");
	grd.addColorStop(0.6, "#000000");
	context.fillStyle = grd;
	context.fill();

	// overlay gauge background
	drawArc(context, this.centerX, this.centerY, this.gaugeDiam - this.rimWidth, 0, 2*Math.PI, false, "#000000", 1);
	context.fillStyle = this.faceColor;
	context.fill();

	// outer scale arc
	drawArc(context, this.centerX, this.centerY, this.outerScaleDiam, this.startRadian, this.endRadian, false, this.outerScaleColor, 1.25);

	// draw outer scale major indicator markings
	drawOuterSteps(context, this.lookupTbl, this.outerScaleDiam, this.outerScaleDiam + 5, this.centerX, this.centerY, this.outerScaleColor, 1, this.outerScaleIntervals[0], this.inputGranularity, true, this.outerScaleFnt, this.startRadian, this.endRadian, this.outerScaleRange.s);

	// draw outer scale minor indicator markings
	if (this.outerScaleIntervals[1] > 0) {
		drawOuterSteps(context, this.lookupTbl, this.outerScaleDiam, this.outerScaleDiam + 3, this.centerX, this.centerY, this.outerScaleColor, 1, this.outerScaleIntervals[1], this.inputGranularity);
	}

	// draw outer scale subminor indicator markings
	if (this.outerScaleIntervals[2] > 0) {
		drawOuterSteps(context, this.lookupTbl, this.outerScaleDiam, this.outerScaleDiam + 1, this.centerX, this.centerY, this.outerScaleColor, 1, this.outerScaleIntervals[2], this.inputGranularity);
	}

	if (this.hasInnerScale) {

		var innerStart = this.outerScaleRange.s * this.innerScaleConvFactor,
			innerEnd = this.outerScaleRange.e * this.innerScaleConvFactor,
			innerTotUnits = (innerEnd - innerStart);

		// inner scale arc
		drawArc(context, this.centerX, this.centerY, this.innerScaleDiam, this.startRadian, this.endRadian, false, this.innerScaleColor, 1.25);

		// draw inner scale major indicator markings
		drawInnerSteps(context, this.lookupTbl, this.innerScaleDiam, this.innerScaleDiam - 5, this.centerX, this.centerY, this.innerScaleColor, 1, this.innerScaleIntervals[0], this.innerScaleStartLabel, innerStart, innerEnd, this.innerScaleToEnd, true, this.outerScaleFnt, this.startRadian, this.endRadian);

		// draw inner scale minor indicator markings
		if (this.innerScaleIntervals[1] > 0) {
			drawInnerSteps(context, this.lookupTbl, this.innerScaleDiam, this.innerScaleDiam - 3, this.centerX, this.centerY, this.innerScaleColor, 1, this.innerScaleIntervals[1], this.innerScaleStartLabel, innerStart, innerEnd, this.innerScaleToEnd);
		}

		// draw inner scale subminor indicator markings
		if (this.innerScaleIntervals[2] > 0) {
			drawInnerSteps(context, this.lookupTbl, this.innerScaleDiam, this.innerScaleDiam - 1, this.centerX, this.centerY, this.innerScaleColor, 1, this.innerScaleIntervals[2], this.innerScaleStartLabel, innerStart, innerEnd, this.innerScaleToEnd);
		}
	}

	// inner black circle
	drawArc(context, this.centerX, this.centerY, this.dialBaseDiam, 0, 2*Math.PI, true, "#787878", 1);
	grd = context.createRadialGradient(this.centerX, this.centerY, this.dialBaseDiam, this.centerX, this.centerY, 0);
	grd.addColorStop(0, "#000");
	grd.addColorStop(.2, "#222");
	grd.addColorStop(0.5, "#555");
	grd.addColorStop(0.85, "#777");
	
	context.fillStyle = grd;
	context.fill();	

	// draw pointer
	context.strokeStyle = this.pointerColor;
	context.lineWidth = 1.5;
	drawTickMark(context, this.lookupTbl[this.index][0], this.lookupTbl[this.index][1], this.dialBaseDiam, this.outerScaleDiam + 15, this.centerX, this.centerY);

	// draw minor unit
	writeMessage(context, this.innerScaleUnit, this.innerScaleFnt, this.innerScaleColor, "center", "top", this.centerX, this.minorUnitY);

	// draw major unit
	writeMessage(context, this.outerScaleUnit, this.outerScaleFnt, this.outerScaleColor, "center", "top", this.centerX, this.majorUnitY);

	// draw digital display
	context.beginPath();
	context.strokeStyle = "black";
	context.lineWidth = 2;
	context.rect(this.digDispX - 5, this.digDispY - 3, this.digWd + 10, this.digHt + 8);
	context.stroke();
	context.fillStyle = this.digBC;
	context.fill();
	context.closePath();
	var digNum = "" + (this.index * this.inputGranularity).toFixed(this.digDispFixed).toString(), zero = "0";
	for (var i = 0; i < this.maxDigits - this.index.toString().length; i++) {
		digNum = zero + digNum;
	}

	// to right justify display, assume each digit display is about 2/3 as wide as it is tall
	writeMessage(context, digNum.toString(), this.digFnt, this.outerScaleColor, "center", "top", (this.digDispX + (this.digWd / 2)), this.digDispY);

};

Gauge.prototype.updateSettings = function(gaugeSettings) {
		this.inputGranularity = (gaugeSettings.hasOwnProperty("inputGranularity")) ? gaugeSettings.inputGranularity : 1;
	if (this.inputGranularity > 1 || this.inputGranularity <= 0) this.inputGranularity = 1;
	
	//***** gauge title properties  *****// 
	this.gaugeNameLn1 = (gaugeSettings.hasOwnProperty("titleLine1")) ? gaugeSettings.titleLine1 : "";
	this.gaugeNameLn2 = (gaugeSettings.hasOwnProperty("titleLine2")) ? gaugeSettings.titleLine2 : "";
	this.gaugeNmFnt = (gaugeSettings.hasOwnProperty("titleFont")) ? gaugeSettings.titleFont : "18pt Arial";

	//***** gauge border and background properties  *****// 
	this.gaugeDiam = (gaugeSettings.hasOwnProperty("gaugeDiam")) ? gaugeSettings.gaugeDiam : 175;
	this.rimWidth = (gaugeSettings.hasOwnProperty("rimWidth")) ? gaugeSettings.rimWidth : 25;
	this.faceColor = (gaugeSettings.hasOwnProperty("faceColor")) ? gaugeSettings.faceColor : "white";	

	//***** centerpoint of gauge  *****// 
	this.centerX = (gaugeSettings.hasOwnProperty("centerX")) ? gaugeSettings.centerX : 200;
	this.centerY = (gaugeSettings.hasOwnProperty("centerY")) ? gaugeSettings.centerY : 250;

	//***** start and finish degrees of scale  *****// 
	this.startDegree = (gaugeSettings.hasOwnProperty("startDegree")) ? gaugeSettings.startDegree : 135;
	this.endDegree = (gaugeSettings.hasOwnProperty("endDegree")) ? gaugeSettings.endDegree : 405;
	this.startRadian = this.startDegree * (Math.PI/180);
	this.endRadian = this.endDegree * (Math.PI/180);

	//***** major scale properties  *****//
	this.outerScaleDiam = (gaugeSettings.hasOwnProperty("outerScaleDiam")) ? gaugeSettings.outerScaleDiam : 100;

	// first and last values (numbers) shown on the scale
	this.outerScaleRange = (gaugeSettings.hasOwnProperty("outerScaleRange")) ? gaugeSettings.outerScaleRange : {s: 0, e: 6000};

	// interval = # of units between scale's major, minor and subminor indicator marks (set an interval to 0 if not applicable)
	this.outerScaleIntervals = (gaugeSettings.hasOwnProperty("outerScaleIntervals")) ? gaugeSettings.outerScaleIntervals : [500,100,0];

	this.outerScaleFnt = (gaugeSettings.hasOwnProperty("outerScaleFnt")) ? gaugeSettings.outerScaleFnt : "8pt Calibri";
	this.outerScaleColor = (gaugeSettings.hasOwnProperty("outerScaleColor")) ? gaugeSettings.outerScaleColor : "black";
	this.outerScaleUnit = (gaugeSettings.hasOwnProperty("outerScaleUnit")) ? gaugeSettings.outerScaleUnit : "PSI";

	//***** minor scale properties  *****//
	// include inner scale?
	this.hasInnerScale = (gaugeSettings.hasOwnProperty("hasInnerScale")) ? gaugeSettings.hasInnerScale : false;

	// decimal number to multiply outer scale value by to get equivalent inner scale value (for determining step intervals for marking inner scale indicators)
	this.innerScaleConvFactor = (gaugeSettings.hasOwnProperty("innerScaleConvFactor")) ? gaugeSettings.innerScaleConvFactor : 0.068573;
	
	this.innerScaleDiam = (gaugeSettings.hasOwnProperty("innerScaleDiam")) ? gaugeSettings.innerScaleDiam : 96;

	// start labeling major indicator marks at this number
	this.innerScaleStartLabel = (gaugeSettings.hasOwnProperty("innerScaleStartLabel")) ? gaugeSettings.innerScaleStartLabel : 0;

	// interval = # of units between scale's major, minor and subminor indicator marks (set an interval to 0 if not applicable)
	this.innerScaleIntervals = (gaugeSettings.hasOwnProperty("innerScaleIntervals")) ? gaugeSettings.innerScaleIntervals : [50,10,0];

	this.innerScaleFnt = (gaugeSettings.hasOwnProperty("innerScaleFnt")) ? gaugeSettings.innerScaleFnt : "8pt Arial";
	this.innerScaleColor = (gaugeSettings.hasOwnProperty("innerScaleColor")) ? gaugeSettings.innerScaleColor : "red";
	this.innerScaleUnit = (gaugeSettings.hasOwnProperty("innerScaleUnit")) ? gaugeSettings.innerScaleUnit : "Kg/cm3";

	// if end of range is before end of outer scale's range, should additional tick markings be shown?
	this.innerScaleToEnd = (gaugeSettings.hasOwnProperty("innerScaleToEnd")) ? gaugeSettings.innerScaleToEnd : true;

	//***** dial base/center circle properties  *****//
	this.dialBaseDiam = (gaugeSettings.hasOwnProperty("dialBaseDiam")) ? gaugeSettings.dialBaseDiam : 25;
	
	//***** pointer properties  *****//
	this.pointerColor = (gaugeSettings.hasOwnProperty("pointerColor")) ? gaugeSettings.pointerColor : "blue";
	
	//***** conversions, lookups, max settings  *****//
	this.maxSteps = ((this.outerScaleRange.e - this.outerScaleRange.s) / this.inputGranularity) + 1;
	this.lookupTbl = createLookupTbl(this.startRadian, this.endRadian, this.maxSteps);
	this.innerStepConvRate = this.maxSteps / ((this.outerScaleRange.e * this.innerScaleConvFactor) - (this.outerScaleRange.s * this.innerScaleConvFactor));

	//***** digital display properties  *****//
	this.digWd = (gaugeSettings.hasOwnProperty("digWd")) ? gaugeSettings.digWd : 60; 
	this.digHt = (gaugeSettings.hasOwnProperty("digHt")) ? gaugeSettings.digHt : 14;
	this.digFnt = (gaugeSettings.hasOwnProperty("digFnt")) ? gaugeSettings.digFnt : "12pt Calibri";
	this.digBC = (gaugeSettings.hasOwnProperty("digBC")) ? gaugeSettings.digBC : "#efefef";
	this.digDispX = this.centerX - (this.digWd / 2);  
	this.digDispY = this.centerY + this.outerScaleDiam + (this.digHt / 2); 
	this.maxDigits = Math.floor(this.outerScaleRange.e).toString().length;
	this.digDispFixed = 0;
	if (this.inputGranularity < 1) {
		// add digits for decimal and 1 - 3 decimals
		var decs = this.inputGranularity.toFixed(3).toString(), addTo = 2;
		if (decs.substr(decs.length - 1,1) == "0") {
			addTo++;
			if (decs.substr(decs.length - 2,1) == "0") addTo++;
		}
		this.maxDigits += addTo;
		this.digDispFixed = addTo - 1;
	}

	//***** font sizes for spacing calculations  *****//
	this.gaugeNmFS = parseInt(this.gaugeNmFnt.replace(/[^0-9 ]/g, ""));
	if (!this.gaugeNmFS) this.gaugeNmFS = 18;

	this.outerScaleFS = parseInt(this.outerScaleFnt.replace(/[^0-9 ]/g, ""));
	if (!this.outerScaleFS) this.outerScaleFS = 8;

	this.innerScaleFS = parseInt(this.innerScaleFnt.replace(/[^0-9 ]/g, ""));
	if (!this.innerScaleFS) this.innerScaleFS = 8;
	
	this.digFS = parseInt(this.digFnt.replace(/[^0-9 ]/g, ""));
	if (!this.digFS) this.digFS = 12;

	//***** unit label positions *****//
	this.gap = ((this.centerY + this.outerScaleDiam) - (this.centerY + this.dialBaseDiam) - ((this.outerScaleFS + this.innerScaleFS) * 1.25)) / 7;
	this.minorUnitY = this.centerY + this.dialBaseDiam + (this.gap * 3);
	this.majorUnitY = this.minorUnitY + this.innerScaleFS + this.gap;

	// current input level
	this.inputLevel = this.outerScaleRange.s;

};

Gauge.prototype.setInputLevel = function(input) {
	this.inputLevel = input;
	this.index = Math.floor((input - this.outerScaleRange.s) / this.inputGranularity);
	if (this.index < 0) this.index = 0;
	if (this.index >= this.maxSteps) this.index = this.maxSteps - 1;
};