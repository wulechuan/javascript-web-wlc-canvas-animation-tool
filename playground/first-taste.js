wlcSetupCanvasAnimation('c1', letsHaveATryAndDrawSomething, {
    drawingFramesCountLimit: 3,
    defaultBgColor: 'black'
});


function letsHaveATryAndDrawSomething(canvas, ctx, localTime) {
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'red';
    ctx.fillStyle   = 'pink';

    var t = localTime*3;
    var centerX = 150;
    var centerY = 80;
    var radius = 50 + 0 * Math.sin(t*0.5+Math.PI/2);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(centerX + radius * Math.sin(t), centerY + radius * Math.cos(t));
    ctx.stroke();
    ctx.fill();
}