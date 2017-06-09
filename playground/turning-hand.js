function drawTurningHand(canvas, ctx, localTimeInSeconds) {
	ctx.lineWidth   = 3;
	ctx.strokeStyle = 'red';
	ctx.fillStyle   = 'pink';

	var t = localTimeInSeconds*3;
	var centerX = 150;
	var centerY = 80;
	var radius = 50 + 0 * Math.sin(t*0.5+Math.PI/2);

	ctx.beginPath();
	ctx.moveTo(centerX, centerY);
	ctx.lineTo(centerX - radius * Math.sin(t), centerY + radius * Math.cos(t));
	ctx.stroke();
	ctx.fill();
}