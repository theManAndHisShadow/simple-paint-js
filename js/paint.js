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
            "resize": {
                description: "Resize brush",
                type: "input",
                render: '<input placeholder="5">',
                action: function(value){
                    console.log(value);
                    PaintTools.#instance.parent.brush.setSize(value);
                },
            },

            "brush": {
                icon: "fa-paintbrush",
                description: "Brush tool",
                type: "toggle",
                action: function(){
                    PaintTools.#instance.parent.brush.setColor(PaintTools.#instance.pallete.selected);
                },
            },

            "symmetry-tool": {
                icon: "fa-asterisk",
                description: "Symmetry drawning tool",
                type: "click",
                action: function(){
                    
                },
            },

            "eraser": {
                icon: "fa-eraser",
                description: "Eraser tool",
                type: "toggle",
                action: function(){
                    PaintTools.#instance.parent.brush.setColor('white');
                },
            },

            // "color-picker": {
            //     icon: "fa-eye-dropper",
            //     description: "Color picker",
            //     type: "toggle",
            //     action: function(){
            //         // soon
            //     },
            // },

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

                    // size range limitation
                    value = value >= 50 ? 50 : value;
                    value = value <= 0 ? 1 : value;

                    toolElement.children[0].value = value;

                    tools[tool].action(value);
                });
            } else {
            // actions by item clicking
            toolElement.addEventListener('click', function(){
                // execute tool action
                tools[tool].action();

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

    constructor(parent, color = 'black', size = 5){
        if (PaintBrush.#instance) {
            return PaintBrush.#instance;
        }

        PaintBrush.#instance = this;

        this.parent = parent;

        // brush body properties not same thing as brush props
        this.body = {
            node: null,
            x: null,
            y: null,
            color: 'white',
            borderColor: 'black',
            size: size,
        }
        

        this.x = null;
        this.y = null,

        this.trace = [];

        this.color = color;
        this.size = size;

        this.isPressed = false;
        
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
        let {offsetX, offsetY} = this.#calculateCanvasOffset();
        this.x = event.offsetX + 7;
        this.y = event.offsetY + 7;

        this.body.x = event.offsetX + offsetX;
        this.body.y = event.offsetY + offsetY;
    }

    /**
     * Method sticks brush to mouse pointer.
     */
    #moveBrushWithMouse(){

        this.body.node.style  = `
            position: absolute;
            width: 10px;
            height: 10px;
            background: ${this.body.color};
            border-radius: 100%;
            border: 1px solid ${this.body.borderColor};
            left: ${this.body.x}px;
            top: ${this.body.y}px;
            z-index: 999;
        `;
    }

    setColor(color){
        this.color = color;
    }

    setSize(size){
        this.size = size;
        this.body.size = size;
    }

    /**
     * Draws on canvas.
     */
    draw(){
        // draw only when user press mouse button
        if(PaintBrush.#instance.isPressed){
            // save current coords to trace buffer
            this.trace.push([this.x, this.y]);

            let c = this.parent.canvas.context;
            let traceBufferNotEmpty = this.trace.length > 1;


            c.beginPath();
            c.arc(this.x, this.y, this.size * 0.5, 0, 2 * Math.PI, false);
            c.fillStyle = this.color;
            c.fill();
            c.closePath(); 

            // if trace buffer not empty
            if(traceBufferNotEmpty) {
                let lastPoint = this.trace[0];
                let currentPoint = this.trace[1];
                
                // glue a points using trace points
                c.strokeStyle = this.color;
                c.beginPath();
                c.moveTo(lastPoint[0], lastPoint[1]);
                c.lineTo(currentPoint[0], currentPoint[1]);
                c.lineWidth = this.size < 6 ? this.size + 2 : this.size;
                c.stroke(); 
                // c.closePath(); 
                
                // delete trace prev point
                this.trace.shift();
            }
        } else {
            // if user released mouse button - clean buffer
            this.trace = [];
        }
    }

    /**
     * Creates brush element, add to brush.body and to DOM.
     */
    #createBrushNode(){
        let brushElement = document.createElement('div');

        brushElement.id = 'paint__brush';
        this.body.node = brushElement;

        this.parent.parentNode.appendChild(brushElement);
    }

    /**
     * Adds event to document.
     */
    #init(){
        this.#createBrushNode();
        this.parent.canvas.node.addEventListener('mousemove', function(event){
            PaintBrush.#instance.isPressed = event.which === 1 ? true : false;

            PaintBrush.#instance.#writeCoordsToInstance(event, PaintBrush.#instance);
            PaintBrush.#instance.#moveBrushWithMouse();
            PaintBrush.#instance.draw();
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