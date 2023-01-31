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

        PaintColorPalette.#instance =  this;

        this.parent = parent;
    }
}



/**
 * Singleton.
 * Stores brush coordinates, state and brush color.
 */
class PaintBrush {
    static #instance = null;

    constructor(parent, color = 'black', size = 10){
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

    /**
     * Draws on canvas.
     */
    draw(){
        if(PaintBrush.#instance.isPressed){
            let c = this.parent.canvas.context;

            c.beginPath();
            c.arc(this.x, this.y, this.size * 0.5, 0, 2 * Math.PI, false);
            c.fillStyle = this.color;
            c.fill();
            // c.lineWidth = 5;
            // c.strokeStyle = 'blue';
            // c.stroke();
            c.closePath(); 
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
        this.pallete = new PaintColorPalette(this);

        this.#init();
    }

    #init(){
        this.parentNode.appendChild(this.canvas.node);
    }
}