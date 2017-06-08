(function () {
	var canvas = document.getElementById("mycanvas");
	var ctx = canvas.getContext('2d');
	
	var bgColor = 'rgb(219, 240, 255)';
	var waveColorRGB = [63, 159, 255];

	var drawingFramesCountLim = NaN;
	var wallTimeOffset = 1000000;

	var waveOptions = {
		waveComponentCount: 36,

		waterLevel: canvas.height * 0.5,

		wLengthLim1: 100,
		wLengthLim2: 800,

		wSpeedLim1: 80,
		wSpeedLim2: 160,

		// time in milleseconds
		wPhaseOffsetLim1: -400,
		wPhaseOffsetLim2: 400,

		wAmpLim1: 1,
		wAmpLim2: 9
	};

	var ripplesDistributionOptions = {
		waterLevelStep: 8
	};


 
	var ripples = [
		new Ripple(canvas, waveOptions),
		new Ripple(canvas, waveOptions),
		new Ripple(canvas, waveOptions),
		new Ripple(canvas, waveOptions),
   ];



	var wallTime;
	var drawnFramesCount = 0;

	startAnimatioin();








	function startAnimatioin() {
		distributeSomeValuesToAllRipples(ripples);
		wallTime = new Date().getTime() - wallTimeOffset;
		drawAnimation();
	}

	function drawAnimation() {
		drawnFramesCount++;
		if (drawnFramesCount > drawingFramesCountLim) return;

		drawEverythingOnce();
		requestAnimationFrame(drawAnimation);
	}

	function drawEverythingOnce() {
		var localTime = (new Date().getTime() - wallTime) / 1000;

		drawBg();
		for (let ripple of ripples) ripple.draw(localTime);
	}

	function drawBg() {
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}

	function distributeSomeValuesToAllRipples(ripples) {
		var strokeColorDarkenRatio = 0.9;
		var fillColorFadingRatio = 0.75;

		var rippleCount = ripples.length;
		var tempRGBA = waveColorRGB.concat([1]);

		tempRGBA = [].concat(waveColorRGB);
		tempRGBA[0] = Math.floor(tempRGBA[0]*strokeColorDarkenRatio);
		tempRGBA[1] = Math.floor(tempRGBA[1]*strokeColorDarkenRatio);
		tempRGBA[2] = Math.floor(tempRGBA[2]*strokeColorDarkenRatio);
		tempRGBA[3] = 1/rippleCount;
		var wColorStroke = 'rgba('+tempRGBA.join(', ')+')';
		
		tempRGBA = [].concat(waveColorRGB);
		tempRGBA[3] = fillColorFadingRatio/rippleCount;
		var wColorFill = 'rgba('+tempRGBA.join(', ')+')';


		var _i = 0;
		for (let ripple of ripples) {
			ripple.conf({
				waterLevel: ripple.waterLevel += _i*ripplesDistributionOptions.waterLevelStep,
				wColorStroke: wColorStroke,
				wColorFill:   wColorFill
			});
			_i++;
		}
   }
})();


function Ripple(canvas, initOptions) {
	this.canvas = canvas;
	this.canvasContext = canvas.getContext("2d");

	this.strokeWidth = 1;

	this.waveComponentCount = 20;
	this.waveComponents = [];
	this.waveComponentPhaseStep = 500; // time in milleseconds

	this.waterLevel = this.canvas.height * 0.5;
	
	this.wColorStroke = 'navy';
	this.wColorFill = 'blue';

	this.wSpeedLim1 = 200;
	this.wSpeedLim2 = -100;
	this.wAmpLim1 = 10;
	this.wAmpLim2 = 40;
	this.wLengthLim1 = 200;
	this.wLengthLim2 = 300;


	this.draw = function(refTime) {
		drawSuperpositionWave.call(this, refTime);
	};

	this.conf = function (options) {
		function _safelyUpdateProperty(options, attribName, parser, validator) {
			var newValue;
			var _isValid = true;

			if (options.hasOwnProperty(attribName)) {
				newValue = options[attribName];
				if (typeof parser === 'function') {
					newValue = parser(newValue);
				} else if (parser === 'string') {
					_isValid = typeof newValue === 'string';
					newValue = newValue+'';
				} else if (parser === 'int') {
					newValue = parseInt(newValue);
					_isValid = !isNaN(newValue);
				} else {
					newValue = parseFloat(newValue);
					_isValid = !isNaN(newValue);
				}

				if (typeof validator === 'function') {
					_isValid = !!validator(newValue);
				} else if (validator === 'positive'  && typeof newValue === 'number') {
					_isValid = _isValid && newValue > 0;
				} else if (validator === 'non-empty' && typeof newValue === 'string') {
					_isValid = _isValid && !!newValue;
				}

				if (_isValid) {
					this[attribName] = newValue;
					return true;
				}

				return false;
			}
		}

		options = options || {};

		var _somethingChanged = false;
		var _shouldRegenerateComponents = false;

		if (_safelyUpdateProperty.call(this, options, 'waveComponentCount', 'int', 'positive')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'waterLevel')) {
			_somethingChanged = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'wPhaseOffsetLim1')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}
		if (_safelyUpdateProperty.call(this, options, 'wPhaseOffsetLim2')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'wSpeedLim1')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}
		if (_safelyUpdateProperty.call(this, options, 'wSpeedLim2')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'wAmpLim1', null, 'positive')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}
		if (_safelyUpdateProperty.call(this, options, 'wAmpLim2', null, 'positive')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'wLengthLim1', null, 'positive')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}
		if (_safelyUpdateProperty.call(this, options, 'wLengthLim2', null, 'positive')) {
			_somethingChanged = true;
			_shouldRegenerateComponents = true;
		}

		if (_safelyUpdateProperty.call(this, options, 'wColorStroke', 'string', 'non-empty')) {
			_somethingChanged = true;
		}
		if (_safelyUpdateProperty.call(this, options, 'wColorFill', 'string', 'non-empty')) {
			_somethingChanged = true;
		}

		if (_shouldRegenerateComponents) {
			this.waveComponents = generateWaveComponents.call(this);
		}
	};


	this.conf(initOptions);






	function generateWaveComponents() {
		function randomBetween(a, b) {
			return Math.random() * (b-a) + a;
		}
		
		function ratioBetween(v, a, b) {
			if (a==b) return 1;
			return (b - v) /(b - a);
		}
		
		// function valueByRatio(a, b, r) {
		// 	if (a==b) return a;
		// 	return Math.abs(a - b) * r;
		// }


		this.waveComponents = [];
		for (let i=0; i<this.waveComponentCount; i++) {
			let wLength = randomBetween(this.wLengthLim1, this.wLengthLim2);
			let wLengthRatio = ratioBetween(wLength, this.wLengthLim1, this.wLengthLim2);
			let speed = randomBetween(this.wSpeedLim1, this.wSpeedLim2) * wLengthRatio * wLengthRatio * wLengthRatio;

			let ampPeak = randomBetween(this.wAmpLim1, this.wAmpLim2) * wLengthRatio * wLengthRatio * wLengthRatio;

			let amp = randomBetween(0, ampPeak);

			let waveComponent = {
				phaseOffset: randomBetween(this.wPhaseOffsetLim1, this.wPhaseOffsetLim2),
				wLength: wLength,
				speed: speed,
				amp: amp
			};

			this.waveComponents.push(waveComponent);
		}

		return this.waveComponents;
	}


	function drawSuperpositionWave(refTime) {
		this.strokeWidth = 1;

		var C = this.canvas;
		var ctx = this.canvasContext;

		let sampleGapWidth = 2; // pixels
		let left   = -sampleGapWidth;
		let right  = C.width + sampleGapWidth;
		let bottom = C.height;


		ctx.lineWidth   = this.strokeWidth;
		ctx.strokeStyle = this.wColorStroke;
		ctx.fillStyle   = this.wColorFill;

		ctx.beginPath();

		ctx.moveTo(left, bottom);
		ctx.lineTo(left, this.waterLevel);

		for (let sampleX = left; sampleX <= right; sampleX += sampleGapWidth) {
			let sampleY = this.waterLevel;
			let wRefTime = refTime;

			for (let waveComponent of this.waveComponents) {
				let yOffset = evaluateWaveComponentValueOnSample.call(waveComponent, sampleX, wRefTime);
				if (yOffset) sampleY += yOffset;
				wRefTime += this.waveComponentPhaseStep;
			}


			ctx.lineTo(sampleX, sampleY);
		}

		ctx.lineTo(right, bottom);

		ctx.stroke();
		ctx.fill();
	}

	function evaluateWaveComponentValueOnSample(sampleX, wRefTime) {
		let wTime = wRefTime + this.phaseOffset;
		let wLength = this.wLength;
		let speed = this.speed;
		let amp = this.amp;

		let wavePastTimesCount = wTime * speed / wLength;
		let samplePastTimesCount = wavePastTimesCount + sampleX / wLength;
		let sampleY = amp * Math.cos(samplePastTimesCount * Math.PI * 2);
		return sampleY;
	}
}