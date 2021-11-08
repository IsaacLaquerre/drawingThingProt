var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
var coords = [];
var drawMode = "line";
var lineWidth = 1;
var color = "#000000";
var mouseCoords = {};
var isDown = false;
var lastX, lastY;

var offsets = {
    x: 720,
    y: 9
}

ctx.lineWidth = lineWidth;

var lines = [];

function mouseMoved(e) {
    mouseCoords = {
        x: e.clientX - offsets.x,
        y: e.clientY - offsets.y
    };

    if (coords.length === 0) return;

    for (i = 1; i < lines.length; i++) {
        if (lines[i].temp) {
            lines.splice(i, 1);
        }
    }

    switch (drawMode) {
        case "line":
            lines.push({
                mode: "line",
                path: [coords[0][0], coords[0][1], mouseCoords.x, mouseCoords.y],
                width: lineWidth,
                color: "rgba(150, 150, 150, 0.75)",
                temp: true
            });
            break;
        case "circle":
            lines.push({
                mode: "circle",
                path: [coords[0][0], coords[0][1], Math.abs((mouseCoords.x - coords[0][0]) + (mouseCoords.y - coords[0][1])) / 2],
                width: lineWidth,
                color: "rgba(150, 150, 150, 0.75)",
                temp: true
            });
            break;
        case "rectangle":
            lines.push({
                mode: "rectangle",
                path: [coords[0][0], coords[0][1], (mouseCoords.x - coords[0][0]), (mouseCoords.y - coords[0][1])],
                width: lineWidth,
                color: "rgba(150, 150, 150, 0.75)",
                temp: true
            });
            break;
        case "free":
            if (isDown) {
                lines.push({
                    mode: "free",
                    path: [mouseCoords.x, mouseCoords.y],
                    width: lineWidth,
                    color: color,
                });
            }
            break;
        default:
            break;
    }

    drawAll();
}

function mouseEvent(e) {
    coords.push([e.clientX - offsets.x, e.clientY - offsets.y]);

    if (drawMode === "free") {
        switch (e.type) {
            case "mousedown":
                isDown = true;
                lines.push({
                    mode: "free",
                    path: [e.clientX - offsets.x, e.clientY - offsets.y],
                    width: lineWidth,
                    color: color,
                });
                drawAll();
                break;
            case "mouseup":
                isDown = false;
                break;
            default:
                break;
        }
    }

    checkCoords();
}

function checkCoords() {
    if (coords.length >= 2) {

        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth
        ctx.lineJoin = "miter";

        switch (drawMode) {
            case "line":
                ctx.moveTo(coords[0][0], coords[0][1]);
                ctx.lineTo(coords[1][0], coords[1][1]);
                ctx.stroke();

                lines.push({
                    mode: "line",
                    path: [coords[0][0], coords[0][1], coords[1][0], coords[1][1]],
                    width: lineWidth,
                    color: color
                });
                break;
            case "circle":
                ctx.beginPath();
                ctx.arc(coords[0][0], coords[0][1], Math.abs((coords[1][0] - coords[0][0]) + (coords[1][1] - coords[0][1])) / 2, 0, 2 * Math.PI);
                ctx.stroke();

                lines.push({
                    mode: "circle",
                    path: [coords[0][0], coords[0][1], Math.abs((coords[1][0] - coords[0][0]) + (coords[1][1] - coords[0][1])) / 2],
                    width: lineWidth,
                    color: color
                });
                break;
            case "rectangle":
                ctx.rect(coords[0][0], coords[0][1], (coords[1][0] - coords[0][0]), (coords[1][1] - coords[0][1]));
                ctx.stroke();

                lines.push({
                    mode: "rectangle",
                    path: [coords[0][0], coords[0][1], (coords[1][0] - coords[0][0]), (coords[1][1] - coords[0][1])],
                    width: lineWidth,
                    color: color
                });
                break;
            default:
                break;
        }

        removeTemps();

        coords = [];
    }
}

function selectMode(value) {
    drawMode = value;
}

function changeWidth(value) {
    lineWidth = parseInt(value);
    document.getElementById("lineWidthDisplay").innerHTML = value;
    document.getElementById("lineWidthDiv").style.width = (parseInt(value) + 2) + "px";
    document.getElementById("lineWidthDiv").style.height = (parseInt(value) + 2) + "px";
    document.getElementById("lineWidthDiv").style.top = (11 - parseInt(value) * 0.75) + "px";
}

function changeColor(el) {
    color = el.value
    document.getElementById("lineWidthDiv").style.backgroundColor = el.value;
}

function clearCanvas() {
    lines = [];

    ctx.save();

    ctx.beginPath();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

function drawAll() {
    ctx.beginPath();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < lines.length; i++) {
        drawLinePath(lines[i]);
    }
}

function drawLinePath(theObject) {
    var points = theObject.path;
    ctx.save();

    ctx.strokeStyle = theObject.color;
    ctx.lineWidth = theObject.width;
    ctx.lineJoin = "miter";
    ctx.translate(0, 0);
    ctx.beginPath();
    switch (theObject.mode) {
        case "line":
            ctx.moveTo(points[0], points[1]);
            for (var i = 2; i < points.length; i += 1) {
                ctx.lineTo(points[i], points[i + 1]);
            }
            ctx.stroke();
            break;
        case "circle":
            for (var i = 0; i < points.length; i += 1) {
                ctx.arc(points[i], points[i + 1], points[i + 2], 0, 2 * Math.PI);
            }
            ctx.stroke();
            break;
        case "rectangle":
            for (var i = 0; i < points.length; i += 1) {
                ctx.rect(points[i], points[i + 1], points[i + 2], points[i + 3]);
            }
            ctx.stroke();
            break;
        case "free":
            ctx.lineJoin = "round";
            ctx.lineWidth = theObject.width + 0.75;
            ctx.beginPath();
            ctx.moveTo(points[0], points[1]);
            ctx.lineTo(points[0] + 0.1, points[1] + 0.1);
            ctx.closePath();
            ctx.stroke();
            break;
        default:
            break;
    }

    ctx.restore();
}

function removeTemps() {
    for (i in lines) {
        if (lines[i].temp) {
            lines.splice(i, 1);
        }
    }
}