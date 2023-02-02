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

        this.states = {
            undo: [],
            redo: [],
        }

        this.#init();
    }

     /**
     *  Saves application state: canvas inner, brush props to buffer;
     * @param {Array} to save to buffer (redot or undo buffer)
     */
     saveState(to){
        let self = PaintApp.#instance;
        let color = self.brush.color;
        let size = self.brush.size;

        let globalState = {
            brush: {
                color: color,
                size: size,
            },

            canvas: self.canvas.node.toDataURL(),
        };

        (to || self.states.undo).push(globalState);
    }


    /**
     * Restores application state: canvas inner, brush props from buffer;
     * @param {Array} from save from buffer (redot or undo buffer)
     * @param {Array} to save to buffer (redot or undo buffer)
     */
    restoreState(from, to){
        let self = PaintApp.#instance;
        let width = self.canvas.width;
        let height = self.canvas.height;
        let restoredGlobalState = from.length > 0 ? from.pop() : false;
        let image = document.createElement('img');
        
        if(restoredGlobalState){
            self.saveState(to);
            
            image.src = restoredGlobalState.canvas;
            image.onload = function(){
                self.canvas.clear();
                self.canvas.context.drawImage(
                    image, 
                    0, 0, width, height,
                    0, 0, width, height
                );
                


                self.brush.setColor(restoredGlobalState.brush.color);
                self.brush.setSize(restoredGlobalState.brush.size);
            }
        }
    }


    #init(){
        this.parentNode.appendChild(this.canvas.node);
        this.parentNode.appendChild(this.tools.node);
    }
}