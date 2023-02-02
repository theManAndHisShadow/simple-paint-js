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