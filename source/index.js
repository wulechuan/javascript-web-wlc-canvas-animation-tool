function letsHaveATryAndDrawSomething(canvas, ctx, localTime) {
	ctx.lineWidth   = 2;
	ctx.strokeStyle = 'red';
	ctx.fillStyle   = 'pink';

	var t = localTime*8;
    var centerX = 150;
    var centerY = 80;
    var radius = 10 + 30 * Math.sin(t*0.5+Math.PI/2);

	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.lineTo(centerX + radius * Math.sin(t), centerY + radius * Math.cos(t));
	ctx.stroke();
	ctx.fill();
}

wlcSetupCanvasAnimation('c1', letsHaveATryAndDrawSomething, {
    drawingFramesCountLimit: 3,
    defaultBgColor: 'black'
});



function wlcSetupCanvasAnimation(canvas, contextType, drawingFunction, options) {
    // In case we need to draw like 1000 frames and then stop there for ever
	var drawingFramesCountLimit = NaN;
	var wallTimeOffset = 0;
	var defaultBgColor = 'clear';







    if (!(canvas instanceof Node)) {
        if (typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
        } else if (isJQueryObject(canvas)) {
                canvas = canvas[0];
        } else {
            canvas = null;
        }
    }

    if (!canvas) {
        console && console.error('Invalid canvas provided.');
        return;
    }

    if (typeof drawingFunction === 'function' && typeof contextType === 'function') {
        console && console.error('Too many functions provided.');
        return;
    }

    if (typeof contextType === 'function') {
        if (typeof options === 'object') {
            console && console.warn(
                'The third argument will be ignored,',
                'instead of being treated as the "options" object.'
            );
        }
        options = drawingFunction;
        drawingFunction = contextType;
        contextType = '2d';
    } else if (typeof contextType === 'string' && contextType.match(/\s*(3d|webgl)\s*/i)) {
        contextType = 'webgl';
    } else {
        contextType = '2d';
    }

    if (typeof drawingFunction !== 'function') {
        console && console.error('Invalid drawing function provided.');
        return;
    }

    if (typeof options !== 'object') {
        options = {};
    }


	var ctx = canvas.getContext(contextType);

    var _inputTemp;

    _inputTemp = options.bgColor;
    var bgColor = isValidColor(_inputTemp) ? _inputTemp : defaultBgColor;

    _inputTemp = parseFloat(options.wallTimeOffset);
    if (!isNaN(_inputTemp)) wallTimeOffset = _inputTemp;

    _inputTemp = options.drawingFramesCountLimit;
    if (isNaN(_inputTemp)) {
        drawingFramesCountLimit = NaN;
    } else {
        _inputTemp = parseInt(options.drawingFramesCountLimit);
        if (!isNaN(_inputTemp)) wallTimeOffset = _inputTemp;
    }





	var wallTime;
	var drawnFramesCount = 0;
    var shouldStop = false;

	startAnimation();




    function isValidColor(color) {
        return !!color;
    }

	function startAnimation() {
		wallTime = new Date().getTime() - wallTimeOffset;
		drawNextFrame();
	}

	function drawNextFrame() {
		drawnFramesCount++;
		if (drawnFramesCount > drawingFramesCountLimit) return;
        if (shouldStop) return;
		drawOneFrame();
		requestAnimationFrame(drawNextFrame);
	}

	function drawOneFrame() {
		var localTime = (new Date().getTime() - wallTime) / 1000;
		drawBg(localTime);
        drawingFunction(canvas, ctx, localTime);
	}

	function drawBg(localTime) {
        if (bgColor === 'clear') {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
	}
}
