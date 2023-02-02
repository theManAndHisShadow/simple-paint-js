/**
 * Singleton.
 * The main class, stores all the parts and connects everything to each other.
 */
class PaintApp {
    static #instance = null;

    constructor({width, height, appendTo} = {width:400, height: 600, appendTo: document.body}){
        if (PaintApp.#instance) {
            return PaintApp.#instance;
        }

        PaintApp.#instance =  this;

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