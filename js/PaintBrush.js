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
        let self = PaintBrush.#instance;
        let canvas = self.parent.canvas;

        canvas.node.addEventListener('mouseup', function(event){
            self.isPressed = false;

            self.#writeCoordsToInstance(event, self);
            self.drawDot();
        });

        // when user staarts drawning - bofore save canvas state
        canvas.node.addEventListener("mousedown", function(){
            canvas.parent.saveState();
        })

       canvas.node.addEventListener('mousemove', function(event){
            self.isPressed = event.which === 1 ? true : false;

            self.#writeCoordsToInstance(event, self);
            self.drawTrace();
        });
    }
}