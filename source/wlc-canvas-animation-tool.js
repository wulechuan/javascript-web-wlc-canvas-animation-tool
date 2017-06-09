(function (createWhatWeWant) {
	window.wlcCanvasAnimationController = createWhatWeWant();
})(function createWhatWeWant() {
	var DOMPropertyNameForThisTypeOfInstance = 'wlcCanvasAnimationControllerInstance';
	var isJQueryWrappedObjectOrAlike = 'isJQueryWrappedObjectOrAlike';
	var isJQueryWrappedObject = 'isJQueryWrappedObject';
	var isValidColor = 'isValidColor';
	var animationIsStopped = 'animationIsStopped';
	var animationIsPaused = 'animationIsPaused';


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
				// canvas: null
			},
			data: {
				canvasContextType: '2d',
				// canvasContext: null,
			},
			state: {
				animationIsStopped: true,
				animationIsPaused: false,

				animationStartWallTime: NaN,
				localPlayingDurationInSeconds: 0,
				timeOffsetInSeconds: 0,

				drawnFramesCount: 0
			}
		};

		var state = {
			drawingFramesCountLimitation: NaN, // In case we need to draw like 1000 frames and then stop there for ever
		};





		if ((typeof a === 'object' && typeof b === 'object' && a && b)
			|| (typeof a === 'string' && typeof b === 'string')
			|| (typeof a === 'function' && typeof b === 'function')
		) {
			console && console.error('Invalid arguments.');
			return;
		}

		if (!(canvas instanceof Node)) {
			if (typeof canvas === 'string') {
				canvas = document.getElementById(canvas);
			} else if (wlcCanvasAnimationController[isJQueryWrappedObjectOrAlike](canvas)) {
				canvas = canvas[0];
			} else {
				canvas = null;
			}
		}

		if (!canvas) {
			console && console.error('Invalid canvas provided.');
			return;
		}

		if (canvas.tagName.match(/canvas/i)) {
			if (canvas[DOMPropertyNameForThisTypeOfInstance]) {
				return canvas[DOMPropertyNameForThisTypeOfInstance];
			}
		} else {
			var canvasContainer = canvas;
			canvas = document.createElement('canvas');
			canvasContainer.appendChild(canvas);
		}

		privateData.elements.canvas = canvas;




		var requestAnimationFrame = window.requestAnimationFrame;
		var thisInstance = this;

		Object.defineProperty(canvas, DOMPropertyNameForThisTypeOfInstance, {
			enumerable: true,
			writable: false,
			value: thisInstance
		});

		Object.defineProperty(state, animationIsStopped, {
			enumerable: true,
			get: function () {
				return privateData.state[animationIsStopped];
			},
			set: function (newValue) {
				if (newValue) {
					thisInstance.stopAnimation();
				} else {
					thisInstance.startAnimation();
				}

				return privateData.state[animationIsStopped];
			}
		});

		Object.defineProperty(state, animationIsPaused, {
			enumerable: true,
			get: function () {
				return privateData.state[animationIsPaused];
			},
			set: function (newValue) {
				if (newValue) {
					thisInstance.pauseAnimation();
				} else {
					thisInstance.resumeAnimation();
				}

				return privateData.state[animationIsPaused];
			}
		});

		_init.call(thisInstance, a, b);


		thisInstance.state = state;
		thisInstance.config = config.bind(thisInstance);
		thisInstance.getData = getData.bind(thisInstance);
		thisInstance.getCanvas = getCanvas.bind(thisInstance);
		thisInstance.clearCanvas = clearCanvas.bind(thisInstance);

		thisInstance.stopAnimation = stopAnimation.bind(thisInstance);
		thisInstance.startAnimation = startAnimation.bind(thisInstance);
		thisInstance.pauseAnimation = pauseAnimation.bind(thisInstance);
		thisInstance.resumeAnimation = resumeAnimation.bind(thisInstance);

		thisInstance.drawOneFrame = drawOneFrame.bind(thisInstance);
		thisInstance.drawOneFrameOnTime = drawOneFrameOnTimeViaMethod.bind(thisInstance);

		var boundMethods = {
			drawNextFrame: _drawNextFrame.bind(thisInstance)
		};


		if (!privateData.state[animationIsStopped]) {
			thisInstance.startAnimation();
		}






		function _init(a, b) {
			var canvasContextType, initOptions;
			var regExpCanvasContextType = /\s*(2d|3d|webgl)\s*/i;
			var data = privateData.data;

			if (typeof a === 'object' && a) {
				initOptions = a;

				if (typeof b === 'function') {
					thisInstance.drawFrame = b;
				} else if (typeof b === 'string' && b.match(regExpCanvasContextType)) {
					canvasContextType = b.trim().toLowerCase();
					data.canvasContextType = canvasContextType;
				}
			}

			if (typeof b === 'object' && b) {
				initOptions = b;

				if (typeof a === 'function') {
					thisInstance.drawFrame = a;
				} else if (typeof a === 'string' && a.match(regExpCanvasContextType)) {
					canvasContextType = a.trim().toLowerCase();
					data.canvasContextType = canvasContextType;
				}
			}


			data.canvasContext = privateData.elements.canvas.getContext(data.canvasContextType);
			state.bgColor = settings.defaultBgColor;

			config.call(thisInstance, initOptions);

		}

		function config(options) {
			options = options || {};
			var _inputTemp;



			_inputTemp = options.bgColor;
			if (wlcCanvasAnimationController[isValidColor](_inputTemp)) {
				state.bgColor = _inputTemp;
			}



			_inputTemp = parseFloat(options.timeOffsetInSeconds);
			if (!isNaN(_inputTemp)) {
				privateData.state.timeOffsetInSeconds = _inputTemp;
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
				thisInstance.drawFrame = options.drawFrame;
			}

			return thisInstance; // for chaining invocations
		}

		function getData() {
			var copy = {
				elements: {
					canvas: privateData.elements.canvas
				},
				data: {},
				state: {}
			};

			var key;

			for (key in privateData.data) {
				copy.data[key] = privateData.data[key];
			}

			for (key in privateData.state) {
				copy.state[key] = privateData.state[key];
			}

			return copy;
		}

		function getCanvas() {
			return privateData.elements.canvas;
		}

		function clearCanvas() {
			return _clearCanvas.call(thisInstance).stopAnimation();
		}
		function _clearCanvas() {
			var canvas = privateData.elements.canvas;
			privateData.data.canvasContext.clearRect(0, 0, canvas.width, canvas.height);
			return thisInstance; // for chaining invocations
		}

		function stopAnimation(shouldClearCanvas) {
			var privateState = privateData.state;
			privateState[animationIsStopped] = true;
			privateState[animationIsPaused] = false;

			if (shouldClearCanvas) thisInstance.clearCanvas();

			return thisInstance; // for chaining invocations
		}

		function startAnimation(timeOffsetInSeconds) {
			var privateState = privateData.state;
			if (privateState[animationIsPaused] === false && privateState[animationIsStopped] === false) {
				return thisInstance;
			}

			privateState[animationIsPaused] = false;
			privateState[animationIsStopped] = false;

			privateState.animationStartWallTime = new Date().getTime() - privateState.timeOffsetInSeconds;
			privateState.drawnFramesCount = 0;
			privateState.localPlayingDurationInSeconds = 0;

			if (timeOffsetInSeconds) {
				config.call(thisInstance, {
					timeOffsetInSeconds: timeOffsetInSeconds
				});
			}

			_drawNextFrame.call(thisInstance);

			return thisInstance; // for chaining invocations
		}

		function pauseAnimation() {
			var privateState = privateData.state;
			if (privateState[animationIsStopped] === true) return;

			privateState[animationIsPaused] = true;

			return thisInstance; // for chaining invocations
		}

		function resumeAnimation() {
			var privateState = privateData.state;
			if (privateState[animationIsStopped] === true || privateState[animationIsPaused] === false) return;

			privateState[animationIsPaused] = false;
			_drawNextFrame.call(thisInstance);

			return thisInstance; // for chaining invocations
		}

		function drawOneFrame() {
			return _drawOneFrameOnTime.call(thisInstance, privateData.state.localTimeInSeconds);
		}

		function drawOneFrameOnTimeViaMethod(localTimeInSeconds) {
			return _drawOneFrameOnTime.call(thisInstance, localTimeInSeconds).pauseAnimation();		
		}

		function _drawOneFrameOnTime(localTimeInSeconds) {
			return _drawOrClearBg.call(thisInstance, localTimeInSeconds)
				.drawFrame(
					privateData.elements.canvas,
					privateData.data.canvasContext,
					localTimeInSeconds
				);
		}

		function _drawNextFrame(/* DOMHighResTimeStamp */) {
			// The "DOMHighResTimeStamp" provided by the browser
			// is more accurate but NOT what I want.

			var privateState = privateData.state;
			if (   privateState[animationIsPaused] === true
				|| privateState[animationIsStopped] === true
			) {
				return;
			}

			if (typeof thisInstance.drawFrame !== 'function') {
				console.info(
					'The "drawFrame" method is not provided yet.',
					'Animation will not start.'
				);
				thisInstance.stopAnimation();
				return;
			}

			privateState.drawnFramesCount++;
			if (privateState.drawnFramesCount > state.drawingFramesCountLimitation) {
				console.log('Animation frame limitation met. Animation will stop now.');
				thisInstance.stopAnimation();
				return;
			}

			privateState.localPlayingDurationInSeconds =
				(new Date() - privateData.state.animationStartWallTime) / 1000;

			privateState.localTimeInSeconds = privateState.localPlayingDurationInSeconds + privateState.timeOffsetInSeconds;

			drawOneFrame.call(thisInstance);

			requestAnimationFrame(boundMethods.drawNextFrame);
		}

		function _drawOrClearBg() {
			var canvas = privateData.elements.canvas;
			var ctx = privateData.data.canvasContext;

			if (state.bgColor === null || state.bgColor === '' || state.bgColor === false) {
				_clearCanvas.call(thisInstance);
			} else if (state.bgColor !== 'transparent') {
				ctx.fillStyle = state.bgColor;
				ctx.fillRect(0, 0, canvas.width, canvas.height);
			}

			return thisInstance;
		}
	}

	wlcCanvasAnimationController[isJQueryWrappedObjectOrAlike] = function (object) {
		return wlcCanvasAnimationController[isJQueryWrappedObject](object)
			|| object[0] instanceof Node;
	};

	wlcCanvasAnimationController[isJQueryWrappedObject] = function (object) {
		return !!object.__proto__.jquery;
	};

	wlcCanvasAnimationController[isValidColor] = function (color) {
		return !!color;
	};

	return wlcCanvasAnimationController;
});
