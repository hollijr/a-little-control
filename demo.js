window.addEventListener("load", eventWindowLoaded, false);

function eventWindowLoaded () {
  gaugeDemo();
}

function gaugeDemo() {

  var gaugeSettings;
  resetSettings();

  function resetSettings() {
    gaugeSettings = {	
      inputGranularity : 1,
      titleLine1 : "ACCUMULATOR",
      titleLine2 : "PRESSURE",
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
      outerScaleIntervals : [500,100,0],  // not using third interval at present
      outerScaleFnt : "8pt Calibri",
      outerScaleColor : "black",
      outerScaleUnit : "PSI",
      hasInnerScale : true,
      innerScaleConvFactor : 0.068573,
      innerScaleDiam : 96,
      innerScaleStartLabel : 0,
      innerScaleIntervals : [50,10,0],
      innerScaleFnt : "8pt Arial",
      innerScaleColor : "red",
      innerScaleUnit : "Kg/cm3",
      innerScaleToEnd : true,
      dialBaseDiam : 25,
      pointerColor: "blue",
      digWd : 60,
      digHt : 14,
      digFnt : "12pt Calibri",
      digBC : "#efefef"
    };
  }
      
  // Build the slider so user can simulate input
  var sliderCtrl = document.getElementById("slider");  // html slider control
  var sliderCanvas = document.getElementById("sliderCanvas");
  var ctx = sliderCanvas.getContext("2d");
  var canvasHt = parseInt(sliderCanvas.getAttribute('height'), 10);
  var canvasWd = parseInt(sliderCanvas.getAttribute('width'), 10);
  var sliderX = 30;
  var maxSteps, sliderHeight, sliderY, handleY, pxInterval; // handleY is current location of slider handle
  var handleHalfWd = 12, handleHalfHt = 2;  
  var mousedown = false;
  setSliderValues();

  function setSliderValues() {
    maxSteps = gaugeSettings.outerScaleRange.e - gaugeSettings.outerScaleRange.s + 1;
    sliderHeight = canvasHt - 10;  // initial slider height is 10 pixels less than canvas height
    sliderY = sliderHeight + 5; // (x,y) location of center base of slider
    handleY = sliderY;  // handleY is current location of slider handle
    pxInterval = Math.floor(sliderHeight / maxSteps * gaugeSettings.outerScaleIntervals[1]);
  }

  function drawSlider() {

    ctx.rect(0,0,canvasWd,canvasHt);
    ctx.clip();
    ctx.clearRect(0,0,canvasWd,canvasHt);

    var y = sliderY;
    
    // draw slider tick marks			
    ctx.lineWidth = 1;
    for (var i = 0; i < maxSteps; i = i + gaugeSettings.outerScaleIntervals[1]) {
      drawLine(i, y);
      y -= pxInterval;
    }

    y += pxInterval;
    sliderHeight = sliderY - y;  // adjust slider height to actual height based on pixel interval

    // draw vertical slider line
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sliderX, sliderY);
    ctx.lineTo(sliderX, y);
    ctx.stroke();
    ctx.closePath();

    // draw slider handle
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(sliderX - handleHalfWd, handleY, handleHalfHt, (Math.PI/180)*90, (Math.PI/180)*270, false);
    ctx.lineTo(sliderX + handleHalfWd, handleY - handleHalfHt);
    ctx.arc(sliderX + handleHalfWd, handleY, handleHalfHt, (Math.PI/180)*270, (Math.PI/180)*450, false);
    ctx.lineTo(sliderX - handleHalfWd, handleY + handleHalfHt);
    ctx.fill();
    ctx.closePath();
  }

  function drawLine(i, y) {
    var x1 = sliderX - 5, x2 = sliderX + 5, label = false;
    if (i % gaugeSettings.outerScaleIntervals[0] === 0) {
        x1 -= 3;
        x2 += 3;
        label = true;
      }
    ctx.beginPath();
    ctx.moveTo(x1, y);
    ctx.lineTo(x2, y);
    ctx.stroke();
    ctx.closePath();
    if (label) {
      ctx.fillStyle = "blue";
      ctx.textBaseline = "middle";
      ctx.textAlign = "start";
      ctx.fillText(i.toString(), x2 + 8, y);
    }
  }

  sliderCanvas.addEventListener('mousedown', (evt) => {
    mousedown = true;
  });
  window.addEventListener('mouseup', (evt) => {
    mousedown = false;
  });

  sliderCanvas.addEventListener('mousemove', function(evt) {
    if (mousedown) {
      var mousePos = getMousePos(this, evt);
      //var message = onHandle + " -- Mouse position: " + mousePos.x + "," + mousePos.y + " || " + mousePos.msg;
      //writeMessage(this, message);
      if (isOnSlider(mousePos) && !isRunning) {
        var value = (sliderY - mousePos.y) / sliderHeight * maxSteps;
        
        //console.log(value);
        if (value < 0) {
          handleY = sliderY;
        } else if (value >= maxSteps) {
          handleY = sliderY - sliderHeight;
        } else {
          handleY = mousePos.y;
        }
        drawSlider();
        if (!isRunning) {
          // update gauge needle
          gauge.setInputLevel(value);
          gauge.drawScreen();
          // update html slider
          sliderCtrl.value = value / maxSteps * 100;
        }
      }
    }
  }, false);

  function isOnSlider(mousePos) {
    if (mousePos.x >= sliderX - handleHalfWd * 2 && mousePos.x <= sliderX + handleHalfWd * 2 &&
        mousePos.y >= sliderY - sliderHeight && mousePos.y <= sliderY) {
      return true;
    }
    return false;
  }

  function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect(), root = document.documentElement;

        // return relative mouse position
        var mouseX = evt.clientX - rect.left - root.scrollLeft;
        var mouseY = evt.clientY - rect.top - root.scrollTop;
        var pos = {x: mouseX, y: mouseY, msg: "cx: " + evt.clientX + ", cy: " + evt.clientY + ", t: " + rect.top + ", l: " + rect.left + ", st:" + root.scrollTop + ", sl:" + root.scrollLeft};
        //console.log(pos);
        return pos;
    }

  var isRunning = false;
  var inputLevels = {curr : gaugeSettings.outerScaleRange.s};
  inputLevels.targ = setTarget();
  var delay = Math.round(Math.random()*20);
  var tick = 0;
  var btn = document.getElementById('btn');
  btn.addEventListener('click', function() {
          toggleDemo();}, false);

  function setTarget() {
    return gaugeSettings.outerScaleRange.s + 
            (Math.round(Math.random()*((gaugeSettings.outerScaleRange.e - gaugeSettings.outerScaleRange.s) / 
            gaugeSettings.inputGranularity) * gaugeSettings.inputGranularity));
  }
  
  function toggleDemo() {
    if (!isRunning) {
      isRunning = true;
      btn.innerHTML = "Stop Simulation";
      if (timeoutLen == 500) {
        timer = setInterval(function(){runDemo();},100);
      }
    } else {
      isRunning = false;
      btn.innerHTML = "Start Simulation";
      clearInterval(timer);
      timeoutLen = 500;
    }
  }

  function randomBoolean() {
    return Math.round(Math.random()) == 1;
  }

  var gauge = new Gauge("canvas", gaugeSettings);  
  gauge.drawScreen();
  drawSlider();

  var timeoutLen = 500;
  var timer;
  
  function runDemo() {
    var lbl = document.getElementById("lbl");
    lbl.innerHTML = "Running demo..." + (timeoutLen + 1).toString();
    
    if (isRunning) {
      if (inputLevels.curr < inputLevels.targ) {
        inputLevels.curr += (gaugeSettings.outerScaleIntervals[1] * gaugeSettings.inputGranularity);
        if (inputLevels.curr > inputLevels.targ) inputLevels.curr = inputLevels.targ;
      }
      else if (inputLevels.curr > inputLevels.targ) {
        inputLevels.curr -= (gaugeSettings.outerScaleIntervals[1] * gaugeSettings.inputGranularity);
        if (inputLevels.curr < inputLevels.targ) inputLevels.curr = inputLevels.targ;
      }
      else {
        if (tick++ > delay) {
          tick = 0;
          delay = Math.round(Math.random()*30);
          inputLevels.targ = setTarget();
        }
      }
    }
    gauge.setInputLevel(inputLevels.curr);
    gauge.drawScreen();

    if (timeoutLen-- < 0) {
      clearInterval(timer);
      isRunning = false;
      btn.innerHTML = "Start Simulation";
      timeoutLen = 500;
    }
  }

  function resetSliderCtrl() {
    sliderCtrl.value = 0;
  }
  
  // html slider control
  sliderCtrl.addEventListener('input', (e) => {
    //console.log('change');
    if (!isRunning) {
      var value = sliderCtrl.value;
      var pctage = value / 100;
      value = pctage * maxSteps;
      if (value < 0) {
        value = 0;
      } else if (value >= maxSteps) {
        value = maxSteps;
      } 
      // update gauge needle
      gauge.setInputLevel(value);
      gauge.drawScreen();
      // update canvas slider
      handleY = sliderY - (sliderHeight * pctage);
      drawSlider();
    }
  }, false);

  function setSettings() {
    gaugeSettings.inputGranularity = parseFloat(document.getElementById("inputGran").value);
    gaugeSettings.titleLine1 = document.getElementById("title1").value;
    gaugeSettings.titleLine2 = document.getElementById("title2").value;
    gaugeSettings.titleFont = document.getElementById("titleFont").value;
    gaugeSettings.gaugeDiam = parseInt(document.getElementById("gaugeDiam").value, 10);
    gaugeSettings.rimWidth = parseInt(document.getElementById("rimWidth").value, 10);
    gaugeSettings.faceColor = document.getElementById("faceColor").value;
    gaugeSettings.centerX = parseInt(document.getElementById("centerX").value, 10);
    gaugeSettings.centerY = parseInt(document.getElementById("centerY").value, 10);
    gaugeSettings.startDegree = parseInt(document.getElementById("startDegree").value, 10);
    gaugeSettings.endDegree = parseInt(document.getElementById("endDegree").value, 10);
    gaugeSettings.outerScaleDiam = parseInt(document.getElementById("outerScaleDiam").value, 10);
    gaugeSettings.outerScaleRange.s = parseInt(document.getElementById("outerScaleRangeLo").value, 10);
    gaugeSettings.outerScaleRange.e = parseInt(document.getElementById("outerScaleRangeHi").value, 10);
    gaugeSettings.outerScaleIntervals[0] = parseInt(document.getElementById("outerScaleIntervals1").value, 10);
    gaugeSettings.outerScaleIntervals[1] = parseInt(document.getElementById("outerScaleIntervals2").value, 10);
    gaugeSettings.outerScaleFnt = document.getElementById("outerScaleFnt").value;
    gaugeSettings.outerScaleColor = document.getElementById("outerScaleColor").value;
    gaugeSettings.outerScaleUnit = document.getElementById("outerScaleUnit").value;
    gaugeSettings.hasInnerScale = parseBoolean(document.getElementById("hasInnerScale").value);
    gaugeSettings.innerScaleConvFactor = parseFloat(document.getElementById("innerScaleConvFactor").value);
    console.log(gaugeSettings.innerScaleConvFactor);
    gaugeSettings.innerScaleDiam = parseInt(document.getElementById("innerScaleDiam").value, 10);
    gaugeSettings.innerScaleStartLabel = parseInt(document.getElementById("innerScaleStartLabel").value, 10);
    gaugeSettings.innerScaleIntervals[0] = parseInt(document.getElementById("innerScaleIntervals1").value, 10);
    gaugeSettings.innerScaleIntervals[1] = parseInt(document.getElementById("innerScaleIntervals2").value, 10);
    gaugeSettings.innerScaleFnt = document.getElementById("innerScaleFnt").value;
    gaugeSettings.innerScaleColor = document.getElementById("innerScaleColor").value;
    gaugeSettings.innerScaleUnit = document.getElementById("innerScaleUnit").value;
    gaugeSettings.innerScaleToEnd = parseBoolean(document.getElementById("innerScaleToEnd").value);
    gaugeSettings.dialBaseDiam = parseInt(document.getElementById("dialBaseDiam").value, 10);
    gaugeSettings.pointerColor = document.getElementById("pointerColor").value;
    gaugeSettings.digWd = parseInt(document.getElementById("digWd").value, 10);
    gaugeSettings.digHt = parseInt(document.getElementById("digHt").value, 10);
    gaugeSettings.digFnt = document.getElementById("digFnt").value;
    gaugeSettings.digBC = document.getElementById("digBC").value;
  }

  function parseBoolean(str) {
    if (str.toLowerCase() === "true") return true;
    return false;
  }

  // apply settings
  document.getElementById("apply").addEventListener('click', (e) => {
    setSettings();  // read settings from form into gaugeSettings object
    gauge.updateSettings(gaugeSettings);  // update Gauge object with settings object
    inputLevels.curr = gaugeSettings.outerScaleRange.s;  // reset current input to starting level
    gauge.setInputLevel(inputLevels.curr);  // update the gauge so needle is reset
    gauge.drawScreen();  // draw gauge
    setSliderValues();  // update the canvas slider variables so they match new settings
    drawSlider();  // redraw canvas slider
    resetSliderCtrl();  // reset the html slider control
    e.preventDefault(); // prevent default HTTP request on submit
  });

  // reset input fields
  document.getElementById("reset").addEventListener('click', (e) => {
    resetSettings();
    gauge.drawScreen();
    setSliderValues();
    drawSlider();
    resetSliderCtrl();
    e.preventDefault();
  });

} // end gaugeDemo()