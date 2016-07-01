var SimpleChart = function(data) {
    /* Start Private Methods */
    function getHelpers(points) {
        var r = {
            minValue: Infinity,
            maxValue: -Infinity,
            maxLength: 0
        };

        var v;

        points.forEach(function (element) {
            if (element.length > r.maxLength) {
                r.maxLength = element.length;
            }

            v = searchMinMaxValues(element);

            if (r.minValue > v.min) {
                r.minValue = v.min;
            }

            if (r.maxValue < v.max) {
                r.maxValue = v.max;
            }
        });

        return r;
    }

    function getRandomColor() {
        var letters = '0123456789ABCDEF'.split('');
        var color = '#';
        for (var i = 0; i < 6; i++ ) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    function paintBorders(obj) {
        var area = obj.canvas.area,
            context = obj.canvas.context,
            helpers = obj.helpers,
            options = obj.options;

        var translate = {x: -0.5, y: -0.5};

        context.fillStyle = context.strokeStyle
                          = '#000';
        context.lineWidth = 1;

        context.translate(translate.x, translate.y);
        {
            var addX,
                posX = area.start.x,
                posY = area.end.y;

            height = area.height;
            width = area.width;

            if (!options.showGrid) {
                height -= 10;
                width -= 10;
            }

            if (helpers.minValue < 0) {
                posY = -helpers.minValue / (helpers.maxValue - helpers.minValue) * height;
                posY = Math.abs(area.height - posY);
                posY += area.start.y;
            }

            if ((Number(posY) === posY) && (posY % 1 !== 0) && !options.showGrid) {
                posY += 0.5;
            }

            addX = width / (helpers.maxLength - 1);

            for (i = 0, j = helpers.maxLength; i < j; i++) {
                if (options.showGrid) {
                    context.strokeStyle = '#555';

                    context.beginPath();
                    context.moveTo(posX, posY - 2);
                    context.lineTo(posX, posY + 2);
                    context.stroke();

                    context.strokeStyle = '#000';

                    if (posY != area.end.y) {
                        context.beginPath();
                        context.moveTo(posX, area.end.y - 2);
                        context.lineTo(posX, area.end.y + 2);
                        context.stroke();
                    }
                } else {
                    context.beginPath();
                    context.moveTo(posX, posY - 2);
                    context.lineTo(posX, posY + 2);
                    context.stroke();
                }

                posX += addX;
            }

            context.beginPath();
            context.moveTo(area.start.x, area.start.y);
            context.lineTo(area.start.x, area.end.y);
            context.stroke();

            if (options.showGrid) {
                context.beginPath();
                context.moveTo(area.start.x, area.end.y);
                context.lineTo(area.end.x, area.end.y);
                context.stroke();

                if (posY != area.end.y) {
                    context.strokeStyle = '#555';

                    context.beginPath();
                    context.moveTo(area.start.x, posY);
                    context.lineTo(area.end.x, posY);
                    context.stroke();

                    context.strokeStyle = '#000';
                }

                for (i = 0, posX = area.start.x; i < j; i++) {
                    context.beginPath();
                    context.moveTo(posX, area.start.y - 2);
                    context.lineTo(posX, area.start.y + 2);
                    context.stroke();

                    posX += addX;
                }

                context.beginPath();
                context.moveTo(area.start.x, area.start.y);
                context.lineTo(area.end.x, area.start.y);
                context.stroke();

                context.beginPath();
                context.moveTo(area.end.x, area.start.y);
                context.lineTo(area.end.x, area.end.y);
                context.stroke();
            } else {
                context.beginPath();
                context.moveTo(area.start.x, posY);
                context.lineTo(area.end.x, posY);
                context.stroke();

                context.beginPath();
                context.moveTo(area.end.x - 7, posY - 3);
                context.lineTo(area.end.x - 7, posY + 3);
                context.lineTo(area.end.x, posY);
                context.fill();

                context.beginPath();
                context.moveTo(area.start.x - 3, area.start.y + 7);
                context.lineTo(area.start.x + 3, area.start.y + 7);
                context.lineTo(area.start.x, area.start.y);
                context.fill();
            }
        }
        context.translate(-translate.x, -translate.y);
    }

    function paintPoints(obj)
    {
        var area = obj.canvas.area,
            colors = obj.colors,
            context = obj.canvas.context,
            helpers = obj.helpers,
            options = obj.options,
            points = obj.points;

        var addX,
            height,
            pos = {
                x: 0,
                y: 0
            },
            width;

        height = area.height;
        width = area.width;
        if (!options.showGrid) {
            height -= 10;
            width -= 10;
        }

        addX = width / (helpers.maxLength - 1);

        points.forEach(function (element, index) {
            context.lineWidth = 1;
            context.lineJoin = 'round';

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

            pos.x = area.start.x;
            var index = 0;
            context.beginPath();
            element.forEach(function (element) {
                if (element === undefined) {
                    context.strokeStyle = lineColor;
                    context.stroke();

                    context.beginPath();
                    index = 0;
                }

                if ((element === null) || (element === undefined)) {
                    pos.x += addX;
                    return;
                }

                pos.y = (element - helpers.minValue) / (helpers.maxValue - helpers.minValue) * height;
                pos.y = Math.abs(area.height - pos.y);

                if (index == 0) {
                    context.moveTo(pos.x, pos.y + area.start.y);
                } else {
                    context.lineTo(pos.x, pos.y + area.start.y);
                }

                pos.x += addX;

                index++;
            });
            context.strokeStyle = lineColor;
            context.stroke();

            pos.x = area.start.x;
            element.forEach(function (element) {
                if ((element === null) || (element === undefined)) {
                    pos.x += addX;
                    return;
                }

                pos.y = (element - helpers.minValue) / (helpers.maxValue - helpers.minValue) * height;
                pos.y = Math.abs(area.height - pos.y);

                context.beginPath();
                context.arc(pos.x, pos.y + area.start.y, 1.5, 0, 2 * Math.PI);
                context.fillStyle = pointColor;
                context.fill();

                pos.x += addX;
            });
        });
    }

    function searchMinMaxValues(points)
    {
        var min = Infinity,
            max = -Infinity;

        points.forEach(function (element) {
            if ((element === undefined) || (element === null)) {
                return;
            }

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

    function setAreaSize(obj) {
        obj.canvas.area = {
            start: {
                x: 15,
                y: 15
            },
            end: {
                x: obj.canvas.object.width - 15,
                y: obj.canvas.object.height - 15
            },
            height: obj.canvas.object.height - 30,
            width: obj.canvas.object.width - 30
        };
    }

    function setOptions(obj, options) {
        if (options === undefined) {
            return;
        }

        if (options.fullSize === true) {
            obj.options.fullSize = true;
        }

        if (options.showGrid === true) {
            obj.options.showGrid = true;
        }
    }
    /* End Private Methods */

    /* Start Public Methods */
    this.paint = function () {
        paintBorders(this);

        paintPoints(this);
    };

    this.setFullSize = function() {
        var objectParent = this.canvas.object.parentElement;

        if (this.options.fullSize) {
            this.canvas.object.width = objectParent.offsetWidth;

            if ((objectParent.style.height === undefined) || (objectParent.style.height === null) || (objectParent.style.height === '')) {
                this.canvas.object.height = this.canvas.object.width * 0.61803;
            } else {
                this.canvas.object.height = parseFloat(objectParent.style.height);
            }
        }
    };
    /* End Public Methods */

    /* Start Constructor */
    this.canvas = {};
    this.options = {
        fullSize: false,
        showGrid: false,
        startOnZero: false
    };
    this.colors = data.colors;
    this.points = data.points;
    this.helpers = getHelpers(this.points);

    setOptions(this, data.options);

    var obj = this;
    var e = function() {
        obj.canvas.object = document.getElementById(data.id);

        obj.canvas.context = obj.canvas.object.getContext('2d');

        obj.setFullSize();

        setAreaSize(obj);

        obj.paint();
    };

    window.addEventListener('DOMContentLoaded', e);
    window.addEventListener('resize', e);
    /* End Constructor */
};
