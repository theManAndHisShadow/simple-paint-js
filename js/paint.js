/**
 * Singleton.
 * Controls all operations with color palettes and color selection.
 */
class PaintColorPalette {
    static #instance = null;

    constructor(parent){
        if (PaintColorPalette.#instance) {
            return PaintColorPalette.#instance;

        }

        PaintColorPalette.#instance = this;

        this.parent = parent;

        
        this.colors = {
            black: 'black',
            red: '#e91e1e',
            orange: '#ff5722',
            yellow: '#ffc107',
            green: '#4caf50',
            "light-blue": '#00bcd4',
            blue: '#2196f3',
            violet: '#673ab7',
            white: 'white',
        }

        this.node = this.#create();
        
        this.selected = 'black';
    }

    #create(){
        let paletteContainer = document.createElement('div');
        paletteContainer.classList = 'tools__palette-container';

        let colors = Object.keys(this.colors);
        let self =  PaintColorPalette.#instance;

        colors.forEach(color => {
            let colorElement = document.createElement('div');
            colorElement.setAttribute('data-type', 'toggle');
            colorElement.setAttribute('title', 'Color ' + color);
            colorElement.setAttribute('data-color-value', this.colors[color]);

            colorElement.style = `background: ${this.colors[color]}`;

            paletteContainer.appendChild(colorElement);

            colorElement.addEventListener('click', function(){
               self.selected = self.colors[color];
               self.parent.parent.brush.setColor(self.colors[color]);

               let className = 'selected__color';

                // get all selected color
                let allSelected = Array.from(document.getElementsByClassName(className));

                // de-select all
                allSelected.forEach(selected => { selected.classList.remove(className)});

                // select color by clicking
                let selected = colorElement.classList.contains(className);
                colorElement.classList.add(className);
            });
        });

        return paletteContainer;
    }
}



/**
 * Singleton.
 * All paint tools controls by this class.
 */
class PaintTools {
    static #instance = null;

    constructor(parent){
        if (PaintTools.#instance) {
            return PaintTools.#instance;
        }

        PaintTools.#instance =  this;

        this.parent = parent;

        this.node = this.#createNode(),

        this.pallete = new PaintColorPalette(this);

        this.data = {
            /**
             * Example
             * "toolName": {
             *     icon: Button icon (css class for font awesome)
             *     description: Button scription,
             *     type: input | toggle | click - Type of interaction,
             *     render: Additional element inside',
             *     action: callback function with access to: input - inputNode, value, click, toggle - HTMLElement,
             * }
             * */ 

            "resize": {
                description: "Resize brush",
                type: "input",
                render: '<input placeholder="2">',
                action: function(inputNode, value){
                    let maxSize = 99;

                    // size range limitation
                    value = value >= maxSize ? maxSize : value;
                    value = value <= 0 ? 1 : value;

                    inputNode.value = value;

                    PaintTools.#instance.parent.brush.setSize(value);
                },
            },

            "brush": {
                icon: "fa-paintbrush",
                description: "Brush tool",
                type: "toggle",
                action: function(button){
                    PaintTools.#instance.parent.brush.setColor(PaintTools.#instance.pallete.selected);
                },
            },

            "symmetry-tool": {
                icon: "fa-asterisk",
                description: "Symmetry drawning tool",
                type: "click",
                action: function(button){
                    let self = PaintTools.#instance;
                    let canvas = self.parent.canvas;

                    let counterBadge = document.querySelector('#symmetry-tool__counter');
                    let defaultValue = 1;
                    let maxValue = 10;
                    let circle = 360;
                    let n;
                    
                    
                    if(!counterBadge) {
                        counterBadge = document.createElement('span');
                        counterBadge.id = "symmetry-tool__counter";
                        counterBadge.classList.add('tool-counter');
                        counterBadge.setAttribute('data-counter-value', defaultValue);
                        counterBadge.textContent = defaultValue;
                        button.appendChild(counterBadge);

                        
                        canvas.node.addEventListener('draw', ()=> {
                            let s = canvas.symmetryAxes;
                            let alpha = circle / s;
                            let cx = canvas.getCenter()[0]
                            let cy = canvas.getCenter()[1];
                            let brush = self.parent.brush;
                            let x = brush.x;
                            let y = brush.y;
                            
                            let sectorAlpha = 360 - alpha;
                            for(let i = 0; i <= s; i++){
                                sectorAlpha -= alpha;

                                let rotatedDot = canvas.rotate(cx, cy, x, y, sectorAlpha);

                                if(brush.trace.length > 0){
                                    brush.drawMirrorTrace(rotatedDot[0], rotatedDot[1], i)
                                } else {
                                    brush.drawDot(rotatedDot[0], rotatedDot[1]);
                                }
                            }
                        });

                    } else {
                        n = Number(counterBadge.getAttribute('data-counter-value'));
                        n = n >= maxValue ? defaultValue : n + 1;


                        counterBadge.textContent = n;
                        canvas.symmetryAxes = n;
                        counterBadge.setAttribute('data-counter-value', n);
                    }
                },
            },

            "eraser": {
                icon: "fa-eraser",
                description: "Eraser tool",
                type: "toggle",
                action: function(button){
                    PaintTools.#instance.parent.brush.setColor('white');
                },
            },

            "new-canvas": {
                icon: "fa-file",
                description: "New canvas",
                type: "click",
                action: function(){
                    PaintTools.#instance.parent.canvas.clear();
                },
            },
        }

        this.selected = null;

        this.#addTools();
        this.#selectDefault();
    }

    #createNode(){
        let toolsElement = document.createElement('div');

        toolsElement.id = 'paint__tools'

        return toolsElement;
    }

    #addTools(){
        let tools = this.data;

        let toolNames = Object.keys(tools);

        let toolsContainer = document.createElement('div');
        toolsContainer.classList = "tools__buttons-container";

        this.node.appendChild(this.pallete.node);
        this.node.appendChild(toolsContainer);


        toolNames.forEach(tool => {
            let toolElement = document.createElement('div');
            let toolIcon = document.createElement('i');

            toolElement.setAttribute('title',  tools[tool].description);
            toolElement.setAttribute('data-type',  tools[tool].type);
            
            if(tools[tool].render) {
                toolElement.innerHTML = tools[tool].render;
            } else {
                toolIcon.classList = 'fa-solid ' + tools[tool].icon;
            }
            
            toolElement.appendChild(toolIcon);
            toolsContainer.appendChild(toolElement);

            // use diff event to diff tool buttons types
            if(tools[tool].type === 'input'){
                toolElement.children[0].addEventListener('change', function(){
                    // clear input
                    let raw_value = toolElement.children[0].value;
                    let value = Number(raw_value.replace(/([a-zA-Z]|[а-яёА-ЯЁ]|\s)/gm, ''));

                    tools[tool].action(toolElement.children[0], value);
                });
            } else {
            // actions by item clicking
            toolElement.addEventListener('click', function(){
                // execute tool action
                tools[tool].action(toolElement);

                if(tools[tool].type === "toggle"){
                    let className = 'selected__tool';

                    // get all selected items
                    let allSelected = Array.from(document.getElementsByClassName(className));

                    // de-select all
                    allSelected.forEach(selected => { selected.classList.remove(className)});

                    // select item by clicking
                    let selected = toolElement.classList.contains(className);
                    toolElement.classList.add(className);

                    // set selected tool
                    if(selected){
                        PaintTools.#instance.selected = null
                    } else {
                        PaintTools.#instance.selected = tool;
                    }
                }
            })
            }
        });
    }

    #selectDefault(){
        let colors = this.node.children[0];
        let firstColor = colors.children[0];
        let tools = this.node.children[1];
        let firstTool = tools.children[1];

        firstColor.click();
        firstTool.click();
    }
}



/**
 * Singleton.
 * Stores brush coordinates, state and brush color.
 */
class PaintBrush {
    static #instance = null;

    constructor(parent, color = 'black', size = 2){
        if (PaintBrush.#instance) {
            return PaintBrush.#instance;
        }

        PaintBrush.#instance = this;

        this.parent = parent;


        this.x = null;
        this.y = null,

        this.trace = [];
        this.mirrorTrace = [];

        this.color = color;
        this.size = size;

        this.isPressed = false;

        this.events = {
            ondraw: new CustomEvent('draw'),
        }
        
        this.#init();
    }

    /**
     * Calculate offset between canvas and mouse position.
     * @returns Object with offsets
     */
    #calculateCanvasOffset(){
        // NB: maybe this operation decrease performance
        let style = getComputedStyle(this.parent.canvas.node);

        let position_h = Number(style.left.replace('px', '')) * 2;
        let position_v = Number(style.top.replace('px', '')) * 2;

        let width = Number(style.width.replace('px', ''));
        let height = Number(style.height.replace('px', ''));

        let offsetX = ((position_h - width) / 2);
        let offsetY = ((position_v - height) / 2);     
        
        return {
            offsetX: offsetX,
            offsetY: offsetY,
        }
    }

    /**
     * Writes mouse coordinates to class instance.
     * @param {Event} event Mousemove event
     * @param {classRef} intanceRef Reference to class instance
     */
    #writeCoordsToInstance(event, intanceRef){
        this.x = event.offsetX;
        this.y = event.offsetY;
    }

    /**
     * Changes brush color.
     * @param {string} color 
     */
    setColor(color){
        this.color = color;
    }

    /**
     * Changes brush size.
     * @param {number} size 
     */
    setSize(size){
        this.size = size;
    }

    /**
     * Draws brush trace line.
     * @param {number} x trace point x 
     * @param {number} y trace point y
     */
    drawTrace(x, y){
        let self = PaintBrush.#instance;

        x = x || self.x;
        y = y || self.y;

        let canvas = self.parent.canvas;
        let c = canvas.context;

        // draw only when user press mouse button
        if(self.isPressed === true){
            try {
                canvas.node.dispatchEvent(self.events.ondraw);
            } catch (error) {
                
            }

            // save current coords to trace buffer
            self.trace.push([x, y]);

            if(self.trace.length > 1) {
                let lastPoint = self.trace[0];
                let currentPoint = self.trace[1];
                
                c.strokeStyle = self.color;
                c.lineCap = "round";
                c.lineJoin = "round";
                c.lineWidth = self.size;
                
                let line = new Path2D();
                line.moveTo(lastPoint[0], lastPoint[1]);
                line.lineTo(currentPoint[0], currentPoint[1]);
                
                c.stroke(line); 
                
                // delete trace prev point
                self.trace.shift();
            }
        } else {
            // if user released mouse button - clean buffers
            self.trace = [];
            self.mirrorTrace = [];
        }
    }

    /**
     * Draws a symmetrical trace of the main brush
     * @param {number} x mirror trace point x
     * @param {number} y mirror trace point y
     * @param {number} n mirror-trace index (axis number)
     */
    drawMirrorTrace(x, y, n){
        let self = PaintBrush.#instance;
        let canvas = self.parent.canvas;
        let c = canvas.context;
        
        x = x || self.x;
        y = y || self.y;
        n = n || 0;
        
        
        // draw only when user press mouse button
        if(self.isPressed === true){
            // save current coords to mirrorTrace buffer
            if(self.mirrorTrace[n]){
                self.mirrorTrace[n].push([x, y]);
            } else {
                self.mirrorTrace[n] = [];
            }


            self.mirrorTrace.forEach(singleTrace => {
                if(singleTrace.length > 1) {
                    let lastPoint = singleTrace[0];
                    let currentPoint = singleTrace[1];
                    
                    c.strokeStyle = self.color;
                    c.lineCap = "round";
                    c.lineJoin = "round";
                    c.lineWidth = self.size;
                    
                    let line = new Path2D();
                    line.moveTo(lastPoint[0], lastPoint[1]);
                    line.lineTo(currentPoint[0], currentPoint[1]);
                    
                    c.stroke(line); 
                    
                    // delete trace prev point
                    self.mirrorTrace[n].shift();
                }
            });
        }
    }

    /**
     * Draws dot at canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} size dot radius (size)
     */
    drawDot(x, y, size){
        x = x || this.x;
        y = y || this.y;
        size = size || this.size;

        let self = PaintBrush.#instance;
        let canvas =  self.parent.canvas;
        let c = canvas.context;

        if(self.isPressed){
            try {
                canvas.node.dispatchEvent(self.events.ondraw);     
            } catch (error) {}

            c.beginPath();
            c.arc(x, y, size * 0.5, 0, 2 * Math.PI, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath(); 
        };
    }


    /**
     * Adds event to document.
     */
    #init(){
        let self =  PaintBrush.#instance;

        this.parent.canvas.node.addEventListener('mouseup', function(event){
            self.isPressed = false;

            self.#writeCoordsToInstance(event, self);
            self.drawDot();
        });

        this.parent.canvas.node.addEventListener('mousemove', function(event){
            self.isPressed = event.which === 1 ? true : false;

            self.#writeCoordsToInstance(event, self);
            self.drawTrace();
        });
    }
}




/**
 * Singleton.
 * All drawning methods, canvas body contains here.
 */
class PaintCanvas {
    static #instance = null;

    constructor(parent, width, height, color = "white"){
        if (PaintCanvas.#instance) {
            return PaintCanvas.#instance;
        }

        PaintCanvas.#instance =  this;

        this.parent = parent;
        
        // canvas color - when canvas cleaned
        this.color = color;
        this.width = width;
        this.height = height;

        this.node = this.#createCanvas(width, height);
        this.context = this.node.getContext('2d');

        this.symmetryAxes = 1;

        this.#init();
    }

    /**
     * Create HTMLCanvasElement (canvas node)
     * @param {number} width Canvas width
     * @param {number} height Canvas height
     * @returns canvas node ref.
     */
    #createCanvas(width, height){
        let canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        return canvas;
    }

    /**
     * Returns canvas center point
     * @returns [x, y]
     */
    getCenter(){
        return [this.width / 2, this.height / 2];
    }

    /**
     * Rotates given point around another point (for example, canvas center).
     * @param {number} cx central point x
     * @param {number} cy central point y
     * @param {number} x target point x
     * @param {number} y target point y
     * @param {number} angle rotation angle (in gradus)
     * @returns [x, y] with new coordinates
     */
    rotate(cx, cy, x, y, angle) {
        let radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return [Math.round(nx), Math.round(ny)];
    }

    /**
     * Clear canvas inner.
     */
    clear(){
        this.context.fillStyle = this.color;
        this.context.fillRect(0, 0, this.width, this.height)
    }

    #init(){
        this.clear();
    }
}




/**
 * Singleton.
 * The main class, stores all the parts and connects everything to each other.
 */
class Paint {
    static #instance = null;

    constructor({width, height, appendTo} = {width:400, height: 600, appendTo: document.body}){
        if (Paint.#instance) {
            return Paint.#instance;
        }

        Paint.#instance =  this;

        this.parentNode = appendTo;

        this.canvas = new PaintCanvas(this, width, height);
        this.brush = new PaintBrush(this);
        this.tools = new PaintTools(this);

        this.#init();
    }

    #init(){
        this.parentNode.appendChild(this.canvas.node);
        this.parentNode.appendChild(this.tools.node);
    }
}