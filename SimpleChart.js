function SimpleChart(data) {
    var canvas = {};

    function drawPoints(points, colors, modifiers)
    {
        maxLength = modifiers.maxLength - 1;

        var posX, addX = canvas.width / maxLength;
        points.forEach(function (element, index, array) {
            canvas.context.lineWidth = 1;

            lineColor = pointColor
                      = getRandomColor();

            if (colors !== undefined) {
                if (colors[index] !== undefined) {
                    if (colors[index].point !== undefined) {
                        pointColor = colors[index].point;
                    }

                    if (colors[index].line !== undefined) {
                        lineColor = colors[index].line;
                    }
                }
            }

            posX = 0;
            canvas.context.beginPath();
            element.forEach(function (element, index, array) {
                if (element === undefined) {
                    canvas.context.strokeStyle = lineColor;
                    canvas.context.stroke();

                    canvas.context.beginPath();
                    index = 0;
                }

                if ((element === null) || (element === undefined)) {
                    posX += addX;
                    return;
                }

                posY = (element - modifiers.minValue) / (modifiers.maxValue - modifiers.minValue) * canvas.height;
                posY = Math.abs(canvas.height - posY);

                if (index == 0) {
                    canvas.context.moveTo(posX, posY);
                } else {
                    canvas.context.lineTo(posX, posY);
                }

                posX += addX;
            });
            canvas.context.strokeStyle = lineColor;
            canvas.context.stroke();

            posX = 0;
            element.forEach(function (element, index, array) {
                if ((element === null) || (element === undefined)) {
                    posX += addX;
                    return;
                }

                posY = (element - modifiers.minValue) / (modifiers.maxValue - modifiers.minValue) * canvas.height;
                posY = Math.abs(canvas.height - posY);

                canvas.context.beginPath();
                canvas.context.arc(posX, posY, 1.5, 0, 2 * Math.PI);
                canvas.context.fillStyle = pointColor;
                canvas.context.fill();

                posX += addX;
            });
        });
    }

    function drawScene(canvas, modifiers)
    {
        var translate = {x: 0, y: 0};

        canvas.context.fillStyle = canvas.context.strokeStyle = '#000';
        canvas.context.lineWidth = 1;

        canvas.context.beginPath();
        canvas.context.moveTo(15.5, 10);
        canvas.context.lineTo(15.5, canvas.object.height - 10);
        canvas.context.stroke();

        if (modifiers.minValue < 0) {
            translate.y = -modifiers.minValue / (modifiers.maxValue - modifiers.minValue) * canvas.height;
            translate.y *= -1;

            if ((Number(translate.y) === translate.y) && (translate.y % 1 === 0)) {
                translate.y -= 0.5
            }
        }

        canvas.context.translate(translate.x, translate.y);
        {
            canvas.context.beginPath();
            canvas.context.moveTo(10, canvas.object.height - 15.5);
            canvas.context.lineTo(canvas.object.width - 10, canvas.object.height - 15.5);
            canvas.context.stroke();

            canvas.context.translate(0, -0.5);
            canvas.context.beginPath();
            canvas.context.moveTo(canvas.object.width - 12, canvas.object.height - 12);
            canvas.context.lineTo(canvas.object.width - 12, canvas.object.height - 18);
            canvas.context.lineTo(canvas.object.width - 5, canvas.object.height - 15);
            canvas.context.fill();
        }
        canvas.context.translate(-translate.x, -translate.y);

        canvas.context.translate(0.5, 0.5);
        {
            canvas.context.beginPath();
            canvas.context.moveTo(12, 12);
            canvas.context.lineTo(18, 12);
            canvas.context.lineTo(15, 5);
            canvas.context.fill();
        }
        canvas.context.translate(-0.5, -0.5);
    }

    function getModifiers(points)
    {
        var maxLength = -Infinity,
            maxValue = -Infinity,
            minValue = Infinity;

        points.forEach(function (element, index, array) {
            if (element.length > maxLength) {
                maxLength = element.length;
            }

            values = searchMinAndMaxValues(element);

            if (values.max > maxValue) {
                maxValue = values.max;
            }

            if (values.min < minValue) {
                minValue = values.min;
            }
        });

        return {
            minValue: minValue,
            maxValue: maxValue,
            maxLength: maxLength
        };
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function searchMinAndMaxValues(array)
    {
        var max = -Infinity,
            min = Infinity;
        array.forEach(function (element, index, array) {
            if (element > max) {
                max = element;
            }

            if (element < min) {
                min = element;
            }
        });

        return {
            min: min,
            max: max
        };
    }

    window.onload = function() {
        canvas.object = document.getElementById(data.id);
        canvas.context = canvas.object.getContext('2d');
        canvas.height = canvas.object.height - 35;
        canvas.width = canvas.object.width - 35;

        modifiers = getModifiers(data.points);

        drawScene(canvas, modifiers);

        canvas.context.translate(15.5, 20);

        drawPoints(data.points, data.colors, modifiers);
    }
};
