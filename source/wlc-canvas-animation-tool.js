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

	var pN_shouldClearCanvasBeforeDrawing = 'shouldClearCanvasBeforeDrawing';

	var pN_animationShouldStop = 'animationShouldStop';
	var pN_animationIsStopped = 'animationIsStopped';
	var pN_animationShouldPause = 'animationShouldPause';
	var pN_animationIsPaused = 'animationIsPaused';

	var pN_drawingFramesCountLimitation = 'drawingFramesCountLimitation';
	var pN_timeOffsetInSeconds = 'timeOffsetInSeconds';

	var pN_bgColor = 'bgColor';


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

		var shouldClearCanvasBeforeDrawing = true;
		var bgColor = settings.canvasDefaultBgColor;

		var animationShouldStop = false;
		var animationIsStopped = true;
		var animationShouldPause = false;
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


		// Being public means being writable.
		var publicState = _definePublicState.call(thisInstance);
		thisInstance.state = publicState;


		// Define "this"-bound methods for conveniences and better source code minification.
		var b_drawNextFrame = _drawNextFrame.bind(thisInstance);
		var b_stopAnimation = stopAnimation.bind(thisInstance);
		var b_startAnimation = startAnimation.bind(thisInstance);
		var b_pauseAnimation = pauseAnimation.bind(thisInstance);
		var b_resumeAnimation = resumeAnimation.bind(thisInstance);
		var b_clearCanvas = _clearCanvas.bind(thisInstance);
		var b_drawOneFrame = drawOneFrame.bind(thisInstance);


		thisInstance.config = config.bind(thisInstance);
		thisInstance.getData = getData.bind(thisInstance);
		thisInstance.getCanvas = getCanvas.bind(thisInstance);
		thisInstance.getCanvasContext = getCanvasContext.bind(thisInstance);
		thisInstance.getCanvasContextType = getCanvasContextType.bind(thisInstance);

		thisInstance.stopAnimation = b_stopAnimation;
		thisInstance.startAnimation = b_startAnimation;
		thisInstance.pauseAnimation = b_pauseAnimation;
		thisInstance.resumeAnimation = b_resumeAnimation;

		thisInstance.drawOneFrame = b_drawOneFrame;
		thisInstance.drawOneFrameOnTime = drawOneFrameOnTimeViaMethod.bind(thisInstance);
		thisInstance.clearCanvas = clearCanvasViaMethod.bind(thisInstance);



		_init.call(thisInstance, a, b);







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


			if (!animationShouldStop) {
				// if animationShouldPause,
				// then we still need to first start the animation.
				// Because to pause a stopped animation doesn't make any sence.
				return b_startAnimation();
			}
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
					animationShouldStop: animationShouldStop,
					animationIsStopped: animationIsStopped,
					animationShouldPause: animationShouldPause,
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

		/**
		 * Define some properties using getters and setters,
		 * So that they can be accessed directly in public.
		 * @return {object}
		 */
		function _definePublicState() {
			var publicState = {};

			Object.defineProperty(publicState, pN_animationIsStopped, {
				enumerable: true,
				get: function () {
					return animationIsStopped;
				},
				set: function () {
					console.warn('state.'+pN_animationIsStopped+' is a read-only property.');
					return animationIsStopped;
				}
			});

			Object.defineProperty(publicState, pN_animationIsPaused, {
				enumerable: true,
				get: function () {
					return animationIsPaused;
				},
				set: function () {
					console.warn('state.'+pN_animationIsPaused+' is a read-only property.');
					return animationIsPaused;
				}
			});

			Object.defineProperty(publicState, pN_animationShouldStop, {
				enumerable: true,
				get: function () {
					return animationShouldStop;
				},
				set: function (isToStopAnimation) {
					if (isToStopAnimation) {
						stopAnimation.call(thisInstance);
					} else {
						startAnimation.call(thisInstance);
					}

					return animationShouldStop;
				}
			});

			Object.defineProperty(publicState, pN_animationShouldPause, {
				enumerable: true,
				get: function () {
					return animationShouldPause;
				},
				set: function (isToPauseAnimation) {
					if (isToPauseAnimation) {
						pauseAnimation.call(thisInstance);
					} else {
						resumeAnimation.call(thisInstance);
					}

					return animationShouldPause;
				}
			});

			Object.defineProperty(publicState, pN_shouldClearCanvasBeforeDrawing, {
				enumerable: true,
				get: function () {
					return shouldClearCanvasBeforeDrawing;
				},
				set: function (shouldClear) {
					shouldClearCanvasBeforeDrawing = !!shouldClear;
					return shouldClearCanvasBeforeDrawing;
				}
			});

			Object.defineProperty(publicState, pN_drawingFramesCountLimitation, {
				enumerable: true,
				get: function () {
					return drawingFramesCountLimitation;
				},
				set: function (limitation) {
					if (isNaN(limitation)) {
						drawingFramesCountLimitation = NaN;
					} else {
						limitation = parseInt(limitation);
						if (!isNaN(limitation)) {
							drawingFramesCountLimitation = limitation;
						}
					}

					return drawingFramesCountLimitation;
				}
			});

			Object.defineProperty(publicState, pN_timeOffsetInSeconds, {
				enumerable: true,
				get: function () {
					return timeOffsetInSeconds;
				},
				set: function (offset) {
					offset = parseFloat(offset);
					if (!isNaN(offset)) {
						timeOffsetInSeconds = offset;
					}

					return timeOffsetInSeconds;
				}
			});

			Object.defineProperty(publicState, pN_bgColor, {
				enumerable: true,
				get: function () {
					return bgColor;
				},
				set: function (newColor) {
					if (wlcCanvasAnimationController[pN_isValidColor](newColor)) {
						bgColor = newColor.trim().toLowerCase();
					}

					return bgColor;
				}
			});

			return publicState;
		}

		function config(options) {
			options = options || {};
			var _inputTemp;


			// Just use defined setters to update public values,
			// so that we don't need to write type/value validation codes again here.
			if (options.hasOwnProperty(pN_animationShouldStop)) {
				publicState[pN_animationShouldStop] = options[pN_animationShouldStop];
			}

			if (options.hasOwnProperty(pN_animationShouldPause)) {
				publicState[pN_animationShouldPause] = options[pN_animationShouldPause];
			}

			if (options.hasOwnProperty(pN_shouldClearCanvasBeforeDrawing)) {
				publicState[pN_shouldClearCanvasBeforeDrawing] = options[pN_shouldClearCanvasBeforeDrawing];
			}

			if (options.hasOwnProperty(pN_drawingFramesCountLimitation)) {
				publicState[pN_drawingFramesCountLimitation] = options[pN_drawingFramesCountLimitation];
			}

			if (options.hasOwnProperty(pN_timeOffsetInSeconds)) {
				publicState[pN_timeOffsetInSeconds] = options[pN_timeOffsetInSeconds];
			}

			if (options.hasOwnProperty(pN_bgColor)) {
				publicState[pN_bgColor] = options[pN_bgColor];
			}


			_inputTemp = options.drawFrame;
			if (typeof _inputTemp === 'function') {
				thisInstance.drawFrame = options.drawFrame;
			}

			return thisInstance; // for chaining method invocations
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

		function clearCanvasViaMethod() {
			b_clearCanvas();
			return b_stopAnimation(); // for chaining method invocations
		}

		function _clearCanvas() {
			canvasContext.clearRect(0, 0, canvas.width, canvas.height);
			return thisInstance; // for chaining method invocations
		}

		function stopAnimation(shouldClearCanvas) {
			animationIsStopped = true;
			animationIsPaused = false;

			animationShouldPause = false;
			animationShouldStop = false;

			if (shouldClearCanvas) b_clearCanvas();

			return thisInstance; // for chaining method invocations
		}

		function startAnimation(newTimeOffset) {
			if (!animationIsPaused && !animationIsStopped) {
				return thisInstance;
			}

			animationIsStopped = false;
			animationIsPaused = false;

			drawnFramesCount = 0;
			localPlayingDurationInSeconds = 0;

			// Set twice, if the second value (which is the argument) is invalid and not taken
			// Then the first value (which is zero) takes effects.
			publicState[pN_timeOffsetInSeconds] = 0;
			publicState[pN_timeOffsetInSeconds] = newTimeOffset;

			animationStartWallTime = new Date().getTime() - timeOffsetInSeconds;

			b_drawNextFrame();

			// animationShouldStop = false;
			// animationShouldPause = false;

			return thisInstance; // for chaining method invocations
		}

		function pauseAnimation() {
			if (animationIsStopped || animationIsPaused) return;
			animationIsPaused = true;
			animationShouldPause = false;
			return thisInstance; // for chaining method invocations
		}

		function resumeAnimation() {
			if (animationIsStopped || !animationIsPaused) return;

			animationIsPaused = false;
			b_drawNextFrame();

			return thisInstance; // for chaining method invocations
		}

		function _drawNextFrame(/* DOMHighResTimeStamp */) {
			// The "DOMHighResTimeStamp" provided by the browser
			// is more accurate but unfortunately NOT what I want.

			if (animationIsPaused || animationIsStopped) {
				return;
			}

			if (animationShouldStop) {
				b_stopAnimation();
			}

			if (typeof thisInstance.drawFrame !== 'function') {
				console.info(
					'The "drawFrame" method is not provided yet.',
					'Animation will not start.'
				);
				b_stopAnimation();
				return;
			}

			drawnFramesCount++;
			if (drawnFramesCount > drawingFramesCountLimitation) {
				console.log('Animation frame limitation met. Animation will stop now.');
				b_stopAnimation();
				return;
			}



			localPlayingDurationInSeconds = (new Date() - animationStartWallTime) / 1000;
			localTimeInSeconds = localPlayingDurationInSeconds + timeOffsetInSeconds;




			if (animationShouldPause) {
				b_pauseAnimation();
			}

			b_drawOneFrame();

			requestAnimationFrame(b_drawNextFrame);
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
			if (shouldClearCanvasBeforeDrawing) {
				b_clearCanvas();
			}

			canvasContext.fillStyle = bgColor;
			canvasContext.fillRect(0, 0, canvas.width, canvas.height);

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
		return typeof color === 'string' || !!color;
	};

	return wlcCanvasAnimationController;
});
