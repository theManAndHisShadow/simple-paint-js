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