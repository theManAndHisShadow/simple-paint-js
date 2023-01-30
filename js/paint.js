/**
 * Singleton.
 * Controls all operations with color palettes and color selection.
 */
class PaintColorPalette {
    static #instance = null;

    constructor(){
        if (PaintColorPalette.#instance) {
            return PaintColorPalette.#instance;
        }

        PaintColorPalette.#instance =  this;
    }
}



/**
 * Singleton.
 * Stores brush coordinates, state and brush color.
 */
class PaintBrush {
    static #instance = null;

    constructor({size} = {size: 10}){
        if (PaintBrush.#instance) {
            return PaiPaintBrushnt.#instance;
        }

        PaintBrush.#instance = this;
        
        this.x = null;
        this.y = null;
        this.pressed = null;
        this.size = null;
        
        this.#init();
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
     * Adds event to document.
     */
    #init(){
        document.addEventListener('mousemove', function(event){
            PaintBrush.#instance.#writeCoordsToInstance(event, PaintBrush.#instance);
        });
    }
}



/**
 * Singleton.
 * All drawning methods, canvas body contains here.
 */
class PaintCanvas {
    static #instance = null;

    constructor(width, height, color = "white"){
        if (PaintCanvas.#instance) {
            return PaintCanvas.#instance;
        }

        PaintCanvas.#instance =  this;
        
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

        this.canvas = new PaintCanvas(width, height);
        this.brush = new PaintBrush();
        this.pallete = new PaintColorPalette();
        this.parentNode = appendTo;

        this.#init();
    }

    #init(){
        this.parentNode.appendChild(this.canvas.node);
    }
}