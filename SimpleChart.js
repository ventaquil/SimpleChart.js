var SimpleChart = function(data) {
    "use strict";

    /* Start Private Methods */
    function getHelpers(points, obj) {
        var r = {
            minValue: Infinity,
            maxValue: -Infinity,
            maxLength: 0
        };

        var v;

        points.forEach(function (element, index) {
            if ((obj !== undefined) && !obj.visible[index]) {
                return;
            }

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

        if ((obj !== undefined) && obj.options.startOnZero) {
            if (r.minValue > 0) {
                r.minValue = 0;
            } else if (r.maxValue < 0) {
                r.maxValue = 0;
            }
        }

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
            lineText = obj.lineText,
            options = obj.options;

        var translate = {x: -0.5, y: -0.5};

        context.fillStyle = context.strokeStyle
                          = '#000';
        context.lineWidth = 1;
        context.font = '8px Arial';

        context.translate(translate.x, translate.y);
        {
            var addX,
                posX = area.start.x,
                posY = area.end.y;

            var height = area.height,
                width = area.width;

            if (!options.showGrid) {
                height -= 10;
                width -= 10;
            }

            if (helpers.minValue < 0) {
                if (helpers.maxValue < 0) {
                    posY = height;
                } else {
                    posY = -helpers.minValue / (helpers.maxValue - helpers.minValue) * height;
                }
                posY = Math.abs(area.height - posY);
                posY += area.start.y;
            }

            if ((Number(posY) === posY) && (posY % 1 !== 0) && !options.showGrid) {
                posY += 0.5;
            }

            addX = width / (helpers.maxLength - 1);

            for (var i = 0, j = helpers.maxLength; i < j; i++) {
                if (options.showGrid) {
                    context.beginPath();
                    context.moveTo(posX, posY - 2);
                    context.lineTo(posX, posY + 2);
                    context.stroke();

                    if (posY != area.end.y) {
                        context.beginPath();
                        context.moveTo(posX, area.end.y - 2);
                        context.lineTo(posX, area.end.y + 2);
                        context.stroke();

                        if (lineText[i] !== undefined) {
                            context.fillText(lineText[i], posX - Math.round(context.measureText(lineText[i]).width / 2), posY + 13);
                        }
                    }
                } else {
                    context.beginPath();
                    context.moveTo(posX, posY - 2);
                    context.lineTo(posX, posY + 2);
                    context.stroke();

                    if (lineText[i] !== undefined) {
                        context.fillText(lineText[i], posX - Math.round(context.measureText(lineText[i]).width / 2), posY + 13);
                    }
                }

                posX += addX;
            }

            context.beginPath();
            context.moveTo(area.start.x, area.start.y);
            context.lineTo(area.start.x, area.end.y);
            context.stroke();

            if (options.showGrid) {
                paintGrid(obj);

                context.beginPath();
                context.moveTo(area.start.x, area.end.y);
                context.lineTo(area.end.x, area.end.y);
                context.stroke();

                if (posY != area.end.y) {
                    context.beginPath();
                    context.moveTo(area.start.x, posY);
                    context.lineTo(area.end.x, posY);
                    context.stroke();
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

    function paintGrid(obj) {
        var area = obj.canvas.area,
            context = obj.canvas.context,
            helpers = obj.helpers,
            options = obj.options;

        var width = area.width;

        if (!options.showGrid) {
            width -= 10;
        }

        var addX,
            maxLength = helpers.maxLength - 1;

        addX = width / maxLength;

        context.strokeStyle = '#CCC';

        for (i = 1, j = maxLength; i < j; i++) {
            context.beginPath();
            context.moveTo(addX * i + area.start.x, area.start.y);
            context.lineTo(addX * i + area.start.x, area.end.y);
            context.stroke();
        }

        context.strokeStyle = '#000';
    }

    function paintLabels(obj) {
        var colors = obj.colors,
            labels = obj.labels,
            visible = obj.visible;

        var container = document.getElementById(obj.id + '-labels');

        if (container === null) {
            return;
        }

        container.innerHTML = '';

        var styles;
        styles = document.getElementById('SimpleChart-styles');
        if ((styles === null) || (styles === undefined)) {
            styles = document.createElement('style');
            styles.id = 'SimpleChart-styles';
            styles.type = 'text/css';
            styles.innerHTML = '.simplechart-label{font-family:Arial;font-size:12px;} .simplechart-label div {border-radius:3px;border-style:solid;border-width:2px;display:inline-block;height:5px;margin-right:5px;width:30px;} .simplechart-label div.unvisible {opacity:.5;} div.visible {opacity:1;}';
            document.getElementsByTagName('head')[0].appendChild(styles);
        }

        var label,
            colorBox,
            textBox;
        labels.forEach(function (element, index) {
            colorBox = document.createElement('div');
            if (visible[index]) {
                colorBox.className = 'visible';
            } else {
                colorBox.className = 'unvisible';
            }
            colorBox.style.borderColor = colors[index].line;
            colorBox.style.backgroundColor = colors[index].point;

            textBox = document.createElement('span');
            textBox.appendChild(document.createTextNode(element));

            label = document.createElement('div');
            label.className = 'simplechart-label';
            label.addEventListener('click', function () {
                obj.toggleVisible(index);
            });
            label.appendChild(colorBox);
            label.appendChild(textBox);

            container.appendChild(label);
        });
    }

    function paintPoints(obj) {
        var area = obj.canvas.area,
            colors = obj.colors,
            context = obj.canvas.context,
            helpers = obj.helpers,
            options = obj.options,
            points = obj.points,
            visible = obj.visible;

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

        var lineColor,
            pointColor;

        points.forEach(function (element, index) {
            if (!visible[index]) {
                return;
            }

            context.lineWidth = 1;
            context.lineJoin = 'round';

            lineColor = pointColor
                      = getRandomColor();

            if (colors === undefined) {
                colors = new Array();
            }

            if (colors[index] === undefined) {
                colors[index] = {
                    line: null,
                    point: null
                };
            } else {
                if (colors[index].line !== undefined) {
                    lineColor = colors[index].line;
                }

                if (colors[index].point !== undefined) {
                    pointColor = colors[index].point;
                }
            }

            colors[index].line = lineColor;
            colors[index].point = pointColor;

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

        obj.colors = colors;
    }

    function searchMinMaxValues(points) {
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

    function setLabels(obj, labels) {
        if (labels === undefined) {
            labels = new Array();
        }

        obj.labels = labels;

        obj.points.forEach(function (element, index) {
            if (obj.labels[index] === undefined) {
                obj.labels[index] = 'Unnamed Label';
            }
        });
    }

    function setLineText(obj, lineText) {
        if (lineText === undefined) {
            lineText = new Array();
        }

        for (var i = obj.helpers.maxLength, j = lineText.length; i < j; i++) {
            delete lineText[i];
        }

        obj.lineText = lineText;
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

        if (options.startOnZero === true) {
            obj.options.startOnZero = true;
        }
    }

    function setVisiblePoints(points) {
        var visible = new Array();

        points.forEach(function (element, index) {
            visible[index] = true;
        });

        return visible;
    }
    /* End Private Methods */

    /* Start Public Methods */
    this.draw = function() {
        this.setFullSize();

        setAreaSize(this);

        this.paint();
    };

    this.paint = function() {
        paintBorders(this);

        paintPoints(this);

        paintLabels(this);
    };

    this.setFullSize = function() {
        var objectParent = this.canvas.object.parentElement;

        if (this.options.fullSize) {
            var computedStyle = window.getComputedStyle(objectParent, null);
            this.canvas.object.width = objectParent.offsetWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.borderLeftWidth)) - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.borderRightWidth));

            if ((objectParent.style.height === undefined) || (objectParent.style.height === null) || (objectParent.style.height === '')) {
                this.canvas.object.height = this.canvas.object.width * 0.61803;
            } else {
                this.canvas.object.height = parseFloat(objectParent.style.height);
            }
        }
    };

    this.setUnvisible = function(index) {
        if (this.visible[index] !== undefined) {
            this.visible[index] = false;

            this.helpers = getHelpers(this.points, this);

            this.draw();
        }
    };

    this.setVisible = function(index) {
        if (this.visible[index] !== undefined) {
            this.visible[index] = true;

            this.helpers = getHelpers(this.points, this);

            this.draw();
        }
    };

    this.toggleVisible = function(index) {
        if (this.visible[index] !== undefined) {
            this.visible[index] = !this.visible[index];

            this.helpers = getHelpers(this.points, this);

            this.draw();
        }
    };
    /* End Public Methods */

    /* Start Constructor */
    this.id = data.id;
    this.canvas = {};
    this.options = {
        fullSize: false,
        showGrid: false,
        startOnZero: false
    };
    this.colors = data.colors;
    this.visible = setVisiblePoints(data.points);
    this.points = data.points;

    setOptions(this, data.options);

    this.helpers = getHelpers(this.points, this);

    setLabels(this, data.labels);

    setLineText(this, data.lineText);

    var obj = this;

    window.addEventListener('load', function() {
        obj.canvas.object = document.getElementById(data.id);

        obj.canvas.context = obj.canvas.object.getContext('2d');

        obj.draw();
    });

    window.addEventListener('resize', function() {
        obj.draw();
    });
    /* End Constructor */
};
