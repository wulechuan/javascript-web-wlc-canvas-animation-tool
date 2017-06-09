(function (createWhatWeWant) {
	window.wlcCanvasAnimationController = createWhatWeWant();
})(function createWhatWeWant() {

	// To define some long property names this way helps js better minified.
	// Because we are using local variables as keys to access properties,
	// and local variables can be minified,
	// while strings and direct property keys can not be minified.
	var DOMPropertyNameForThisTypeOfInstance = 'wlcCanvasAnimationControllerInstance';
	var pN_isJQueryWrappedObjectOrAlike = 'isJQueryWrappedObjectOrAlike';
	var pN_isJQueryWrappedObject = 'isJQueryWrappedObject';
	var pN_isValidColor = 'isValidColor';
	var pN_drawingFramesCountLimitation = 'drawingFramesCountLimitation';


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
		var thisInstance = this;

		var settings = {
			canvasDefaultBgColor: '',
			canvasDefaultContextType: '2d'
		};








		// private variables
		var canvasContext = null;
		var canvasContextType = settings.canvasDefaultContextType;
		var bgColor = settings.canvasDefaultBgColor;

		var animationShouldStop = false;
		var animationIsStopped = true;
		var animationIsPaused = false;

		var animationStartWallTime = NaN;
		var timeOffsetInSeconds = 0;
		var localPlayingDurationInSeconds = 0;
		var localTimeInSeconds = 0;

		var drawnFramesCount = 0;
		var drawingFramesCountLimitation = NaN; // In case we need to draw like 1000 frames and then stop there for ever






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
			} else if (wlcCanvasAnimationController[pN_isJQueryWrappedObjectOrAlike](canvas)) {
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
			canvas = canvas.appendChild(document.createElement('canvas'));
		}






		Object.defineProperty(canvas, DOMPropertyNameForThisTypeOfInstance, {
			enumerable: true,
			writable: false,
			value: thisInstance
		});






		var requestAnimationFrame = window.requestAnimationFrame;

		_init.call(thisInstance, a, b);

		thisInstance.state = _definePublicState.call(thisInstance);

		thisInstance.config = config.bind(thisInstance);
		thisInstance.getData = getData.bind(thisInstance);
		thisInstance.getCanvas = getCanvas.bind(thisInstance);
		thisInstance.getCanvasContext = getCanvasContext.bind(thisInstance);
		thisInstance.getCanvasContextType = getCanvasContextType.bind(thisInstance);
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


		if (!animationShouldStop) {
			thisInstance.startAnimation();
		}






		function _init(a, b) {
			var regExpCanvasContextType = /\s*(2d|3d|webgl)\s*/i;
			var initOptions;

			if (typeof a === 'object' && a) {
				initOptions = a;

				if (typeof b === 'function') {
					thisInstance.drawFrame = b;
				} else if (typeof b === 'string' && b.match(regExpCanvasContextType)) {
					canvasContextType = b.trim().toLowerCase();
				}
			}

			if (typeof b === 'object' && b) {
				initOptions = b;

				if (typeof a === 'function') {
					thisInstance.drawFrame = a;
				} else if (typeof a === 'string' && a.match(regExpCanvasContextType)) {
					canvasContextType = a.trim().toLowerCase();
				}
			}

			canvasContext = canvas.getContext(canvasContextType);

			config.call(thisInstance, initOptions);
		}

		function config(options) {
			options = options || {};
			var _inputTemp;



			_inputTemp = options.bgColor;
			if (wlcCanvasAnimationController[pN_isValidColor](_inputTemp)) {
				bgColor = _inputTemp;
			}



			_inputTemp = parseFloat(options.timeOffsetInSeconds);
			if (!isNaN(_inputTemp)) {
				timeOffsetInSeconds = _inputTemp;
			}



			_inputTemp = options[pN_drawingFramesCountLimitation];
			if (isNaN(_inputTemp)) {
				drawingFramesCountLimitation = NaN;
			} else {
				_inputTemp = parseInt(options[pN_drawingFramesCountLimitation]);
				if (!isNaN(_inputTemp)) {
					drawingFramesCountLimitation = _inputTemp;
				}
			}


			_inputTemp = options.drawFrame;
			if (typeof _inputTemp === 'function') {
				thisInstance.drawFrame = options.drawFrame;
			}

			return thisInstance; // for chaining method invocations
		}


		/**
		 * Define some properties using getters and setters,
		 * So that they can be accessed directly in public.
		 * @return {object}
		 */
		function _definePublicState() {
			var publicState = {};

			Object.defineProperty(publicState, 'animationIsStopped', {
				enumerable: true,
				get: function () {
					return animationIsStopped;
				},
				set: function (isToStopAnimation) {
					if (isToStopAnimation) {
						stopAnimation.call(thisInstance);
					} else {
						startAnimation.call(thisInstance);
					}

					return animationIsStopped;
				}
			});

			Object.defineProperty(publicState, 'animationIsPaused', {
				enumerable: true,
				get: function () {
					return animationIsPaused;
				},
				set: function (isToPauseAnimation) {
					if (isToPauseAnimation) {
						pauseAnimation.call(thisInstance);
					} else {
						resumeAnimation.call(thisInstance);
					}

					return animationIsPaused;
				}
			});

			return publicState;
		}

		/**
		 * Get a copy of all private data just for inspection
		 * @return {object}
		 */
		function getData() {
			return {
				elements: {
					canvas: canvas
				},
				data: {
					canvasContext: canvasContext,
					canvasContextType: canvasContextType
				},
				state: {
					animationIsStopped: animationIsStopped,
					animationIsPaused: animationIsPaused,
					animationStartWallTime: animationStartWallTime,
					timeOffsetInSeconds: timeOffsetInSeconds,
					localPlayingDurationInSeconds: localPlayingDurationInSeconds,
					localTimeInSeconds: localTimeInSeconds,
					drawnFramesCount: drawnFramesCount,
					drawingFramesCountLimitation: drawingFramesCountLimitation
				}
			};
		}

		function getCanvas() {
			return canvas;
		}

		function getCanvasContext() {
			return canvasContext;
		}

		function getCanvasContextType() {
			return canvasContextType;
		}

		function clearCanvas() {
			_clearCanvas.call(thisInstance);
			return stopAnimation.call(thisInstance); // for chaining method invocations
		}
		function _clearCanvas() {
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);
			return thisInstance; // for chaining method invocations
		}

		function stopAnimation(shouldClearCanvas) {
			animationIsStopped = true;
			animationIsPaused = false;

			if (shouldClearCanvas) _clearCanvas.call(thisInstance);

			return thisInstance; // for chaining method invocations
		}

		function startAnimation(timeOffsetInSeconds) {
			if (!animationIsPaused && !animationIsStopped) {
				return thisInstance;
			}

			animationIsPaused = false;
			animationIsStopped = false;

			if (timeOffsetInSeconds) {
				config.call(thisInstance, {
					timeOffsetInSeconds: timeOffsetInSeconds
				});
			}

			drawnFramesCount = 0;
			localPlayingDurationInSeconds = 0;
			animationStartWallTime = new Date().getTime() - timeOffsetInSeconds;

			_drawNextFrame.call(thisInstance);

			return thisInstance; // for chaining method invocations
		}

		function pauseAnimation() {
			if (animationIsStopped) return;
			animationIsPaused = true;
			return thisInstance; // for chaining method invocations
		}

		function resumeAnimation() {
			if (animationIsStopped || !animationIsPaused) return;

			animationIsPaused = false;
			_drawNextFrame.call(thisInstance);

			return thisInstance; // for chaining method invocations
		}

		function _drawNextFrame(/* DOMHighResTimeStamp */) {
			// The "DOMHighResTimeStamp" provided by the browser
			// is more accurate but unfortunately NOT what I want.

			if (animationIsPaused || animationIsStopped) {
				return;
			}

			if (typeof thisInstance.drawFrame !== 'function') {
				console.info(
					'The "drawFrame" method is not provided yet.',
					'Animation will not start.'
				);
				stopAnimation.call(thisInstance);
				return;
			}

			drawnFramesCount++;
			if (drawnFramesCount > drawingFramesCountLimitation) {
				console.log('Animation frame limitation met. Animation will stop now.');
				stopAnimation.call(thisInstance);
				return;
			}

			localPlayingDurationInSeconds = (new Date() - animationStartWallTime) / 1000;
			localTimeInSeconds = localPlayingDurationInSeconds + timeOffsetInSeconds;

			drawOneFrame.call(thisInstance);

			requestAnimationFrame(boundMethods.drawNextFrame);
		}

		function drawOneFrame() {
			return _drawOneFrameOnTime.call(thisInstance, localTimeInSeconds);
		}

		function drawOneFrameOnTimeViaMethod(localTimeInSeconds) {
			_drawOneFrameOnTime.call(thisInstance, localTimeInSeconds);
			return pauseAnimation.call(thisInstance); // for chaining method invocations
		}

		function _drawOneFrameOnTime(localTimeInSeconds) {
			_drawOrClearBg.call(thisInstance, localTimeInSeconds)
				.drawFrame(canvas, canvasContext, localTimeInSeconds);
			return thisInstance;
		}

		function _drawOrClearBg() {
			if (bgColor === null || bgColor === '' || bgColor === false) {
				_clearCanvas.call(thisInstance);
			} else if (bgColor !== 'transparent') {
				canvasContext.fillStyle = bgColor;
				canvasContext.fillRect(0, 0, canvas.width, canvas.height);
			}

			return thisInstance;
		}
	}

	wlcCanvasAnimationController[pN_isJQueryWrappedObjectOrAlike] = function (object) {
		return wlcCanvasAnimationController[pN_isJQueryWrappedObject](object)
			|| object[0] instanceof Node;
	};

	wlcCanvasAnimationController[pN_isJQueryWrappedObject] = function (object) {
		return !!object.__proto__.jquery;
	};

	wlcCanvasAnimationController[pN_isValidColor] = function (color) {
		return !!color;
	};

	return wlcCanvasAnimationController;
});
