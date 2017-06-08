/**
 * Constructor for create an instant object that helps making canvas animations.
 * 
 * @constructor
 * @author 吴乐川 <wulechuan@live.com>
 * @argument {!(string|Node|jQueryObject)} canvas the canvas element,
 * 	or the container object that is NOT a canvas element,
 *  under which a new canvas element will be created automatically.
 * 
 * @argument {?(string|function|object)} a Multi-purpose.
 * 		If 1 argument is provided:
 * 		>	If it's a string, it's treated as the canvas context type;
 * 			If it's an object, it's treated as the "options" objet;
 * 			If it's a function, it's treated as the "drawFrame" method.
 * 
 * 		If 2 arguments are provided:
 * 		>	The one that is a string is treated as the canvas context type;
 * 			The one that is an object is treated as the "options" objet;
 * 			The one that is a function is treated as the "drawFrame" method;
 * 
 * 			Tf both are of the same type, e. g. both are functions,
 * 			an error will be logged and construction will fail.
 * 
 * 			If a function is provided, while the other argument being an object,
 * 			and contains a function property named "drawFrame",
 * 			then the property of the object argument is taken,
 * 			the function argument is ignored.
 * 
 * @argument {?(string|function|object)} b Multi-purpose.
 * >	See argument a.
 * 
 * 
 * @example
 * 	var myCanvas = document.querySelector('#my-canvas');
 *  var myAniCtrl = new wlcCanvasAnimationController(
 * 		myCanvas,
 * 		function myFancyDrawingFunction () { ... }
 *  );
 * 
 * @example
 * 	var myCanvas = document.querySelector('#my-canvas');
 *  var myAniCtrl = new wlcCanvasAnimationController(
 * 		myCanvas,
 * 		{
 * 			drawFrame: function myFancyDrawingFunction() { ... }
 * 		}
 *  );
 * 
 * @example
 * 	var myCanvas = document.querySelector('#my-canvas');
 *  var myAniCtrl = new wlcCanvasAnimationController(
 * 		myCanvas,
 * 		'3d',
 * 		{
 * 			drawFrame: function myFancyDrawingFunction() { ... }
 * 		}
 *  );
 */
function wlcCanvasAnimationController(canvas, a, b) {
	var settings = {
		defaultBgColor: ''
	};

	var privateData = {
		elements: {
			canvas: null
		},
		data: {
			canvasContextType: '2d',
			canvasContext: null,
			animationStartWallTime: NaN,
			drawnFramesCount: 0
		}
	};

	var state = {
		animationIsStopped: true,
		animationIsPaused: false, 
		drawingFramesCountLimitation: NaN, // In case we need to draw like 1000 frames and then stop there for ever
		timeOffset: 0 // in milliseconds
	};






	if (!(canvas instanceof Node)) {
		if (typeof canvas === 'string') {
			canvas = document.getElementById(canvas);
		} else if (wlcCanvasAnimationController.isJQueryWrappedObjectOrAlike(canvas)) {
			canvas = canvas[0];
		} else {
			canvas = null;
		}
	}

	if (!canvas) {
		console && console.error('Invalid canvas provided.');
		return;
	}

	if (!canvas.tagName.match(/canvas/i)) {
		var canvasContainer = canvas;
		canvas = document.createElement('canvas');
		canvasContainer.appendChild(canvas);
	}

	privateData.elements.canvas = canvas;

	if ((typeof a === 'object' && typeof b === 'object' && a && b)
		|| (typeof a === 'string' && typeof b === 'string')
		|| (typeof a === 'function' && typeof b === 'function')
	) {
		console && console.error('Invalid arguments.');
		return;
	}



	var requestAnimationFrame = window.requestAnimationFrame;

	_init.call(this, a, b);


	this.state = state;
	this.config = config.bind(this);
	this.getData = getData.bind(this);
	this.getCanvas = getCanvas.bind(this);
	this.clearCanvas = clearCanvas.bind(this);

	this.stopAnimation = stopAnimation.bind(this);
	this.startAnimation = startAnimation.bind(this);
	this.pauseAnimation = pauseAnimation.bind(this);
	this.resumeAnimation = resumeAnimation.bind(this);

	this.drawOneFrame = drawOneFrame.bind(this);
	this.drawOneFrameOnTime = drawOneFrameOnTime.bind(this);

	var boundMethods = {
		drawNextFrame: _drawNextFrame.bind(this)
	};


	if (!state.animationIsStopped) {
		this.startAnimation();
	}






	function _init(a, b) {
		var canvasContextType, initOptions;
		var regExpCanvasContextType = /\s*(2d|3d|webgl)\s*/i;
		var data = privateData.data;

		if (typeof a === 'object' && a) {
			initOptions = a;

			if (typeof b === 'function') {
				this.drawFrame = b;
			} else if (typeof b === 'string' && b.match(regExpCanvasContextType)) {
				canvasContextType = b.trim().toLowerCase();
				data.canvasContextType = canvasContextType;
			}
		}

		if (typeof b === 'object' && b) {
			initOptions = b;

			if (typeof a === 'function') {
				this.drawFrame = a;
			} else if (typeof a === 'string' && a.match(regExpCanvasContextType)) {
				canvasContextType = a.trim().toLowerCase();
				data.canvasContextType = canvasContextType;
			}
		}


		data.canvasContext = privateData.elements.canvas.getContext(data.canvasContextType);
		state.bgColor = settings.defaultBgColor;

		config.call(this, initOptions);

	}

	function config(options) {
		options = options || {};
		var _inputTemp;



		_inputTemp = options.bgColor;
		if (wlcCanvasAnimationController.isValidColor(_inputTemp)) {
			state.bgColor = _inputTemp;
		}



		_inputTemp = parseFloat(options.timeOffset);
		if (!isNaN(_inputTemp)) {
			state.timeOffset = _inputTemp;
		}



		_inputTemp = options.drawingFramesCountLimitation;
		if (isNaN(_inputTemp)) {
			state.drawingFramesCountLimitation = NaN;
		} else {
			_inputTemp = parseInt(options.drawingFramesCountLimitation);
			if (!isNaN(_inputTemp)) {
				state.drawingFramesCountLimitation = _inputTemp;
			}
		}


		_inputTemp = options.drawFrame;
		if (typeof _inputTemp === 'function') {
			this.drawFrame = options.drawFrame;
		}

		return this; // for chaining invocations
	}

	function getData() {
		var copy = {};
		for (var key in privateData) {
			copy[key] = privateData[key];
		}
		return copy;
	}

	function getCanvas() {
		return privateData.elements.canvas;
	}

	function clearCanvas(shouldStopAnimation) {
		var canvas = privateData.elements.canvas;
		privateData.data.canvasContext.clearRect(0, 0, canvas.width, canvas.height);

		if (shouldStopAnimation) this.stopAnimation();

		return this; // for chaining invocations
	}

	function stopAnimation(shouldClearCanvas) {
		state.animationIsStopped = true;
		state.animationIsPaused = false;

		if (shouldClearCanvas) this.clearCanvas();

		return this; // for chaining invocations
	}

	function startAnimation(shouldClearCanvas) {
		if (!state.animationIsPaused && !state.animationIsStopped) {
			return this;
		}

		state.animationIsPaused = false;
		state.animationIsStopped = false;

		var data = privateData.data;
		data.animationStartWallTime = new Date().getTime() - state.timeOffset;
		data.drawnFramesCount = 0;

		boundMethods.drawNextFrame(shouldClearCanvas);

		return this; // for chaining invocations
	}

	function pauseAnimation() {
		if (state.animationIsStopped) return;

		state.animationIsPaused = true;

		return this; // for chaining invocations
	}

	function resumeAnimation() {
		if (state.animationIsStopped || !state.animationIsPaused) return;

		state.animationIsPaused = false;
		boundMethods.drawNextFrame();

		return this; // for chaining invocations
	}

	function drawOneFrame() {
		var localTimeInSeconds = (new Date().getTime() - privateData.data.animationStartWallTime) / 1000;
		this.drawOneFrameOnTime(localTimeInSeconds);

		return this; // for chaining invocations
	}

	function drawOneFrameOnTime(timeInSeconds) {
		_drawOrClearBg.call(this, timeInSeconds);
		this.drawFrame(privateData.elements.canvas, privateData.data.canvasContext, timeInSeconds);

		return this; // for chaining invocations
	}

	function _drawNextFrame(shouldClearCanvas) {
		if (state.animationIsPaused || state.animationIsStopped) return;

		if (typeof this.drawFrame !== 'function') {
			console.info('The drawFrame "method" is not provided yet. Animation will not start.');
			this.stopAnimation();
			return;
		}

		// I'd like to clear *BEFORE* checking drawnFramesCount
		if (shouldClearCanvas) this.clearCanvas();

		var data = privateData.data;

		data.drawnFramesCount++;
		if (data.drawnFramesCount > state.drawingFramesCountLimitation) {
			console.log('Animation frame limitation met. Animation will stop now.');
			this.stopAnimation();
			return;
		}

		this.drawOneFrame();

		requestAnimationFrame(boundMethods.drawNextFrame);
	}

	function _drawOrClearBg() {
		var canvas = privateData.elements.canvas;
		var data = privateData.data;
		var ctx = data.canvasContext;

		if (state.bgColor === null || state.bgColor === '' || state.bgColor === false) {
			this.clearCanvas();
		} else {
			ctx.fillStyle = state.bgColor;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
		}
	}
}

wlcCanvasAnimationController.isJQueryWrappedObjectOrAlike = function (object) {
	return wlcCanvasAnimationController.isJQueryWrappedObject(object)
		|| object[0] instanceof Node;
};

wlcCanvasAnimationController.isJQueryWrappedObject = function (object) {
	return !!Object.getPrototypeOf(object).jquery;
};

wlcCanvasAnimationController.isValidColor = function (color) {
	return !!color;
};