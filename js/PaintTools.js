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

        this.items = {
            /**
             * Example
             * "toolName": {
             *     icon: string - Button icon (css class for font awesome)
             *     tooltip: boolean - Show Tippy.js tooltip or use deafult titile attr
             *     description: string - Button scription,
             *     type: string - input | toggle | click - Type of interaction,
             *     render: string - Additional element inside (html code string),
             *     hotkey: string - ONLY FOR type click! hotkey trigger to invoke action()
             *     action: fuction - callback function with access to: input - inputNode, value, click, toggle - HTMLElement,
             * }
             * */ 

            "resize": {
                description: "Resize brush",
                tooltip: true,
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
                description: "Brush tool [B]",
                tooltip: true,
                type: "toggle",
                hotkey: ['B'],
                action: function(button){
                    PaintTools.#instance.parent.brush.setColor(PaintTools.#instance.pallete.selected);
                },
            },

            "symmetry-tool": {
                icon: "fa-asterisk",
                description: "Symmetry drawning tool [S]",
                tooltip: true,
                type: "click",
                hotkey: 'S',
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
                        counterBadge.setAttribute('items-counter-value', defaultValue);
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
                        n = Number(counterBadge.getAttribute('items-counter-value'));
                        n = n >= maxValue ? defaultValue : n + 1;


                        counterBadge.textContent = n;
                        canvas.symmetryAxes = n;
                        counterBadge.setAttribute('items-counter-value', n);
                    }
                },
            },

            "eraser": {
                icon: "fa-eraser",
                description: "Eraser tool [E]",
                tooltip: true,
                type: "toggle",
                hotkey: 'E',
                action: function(button){
                    PaintTools.#instance.parent.brush.setColor('white');
                },
            },

            "new-canvas": {
                icon: "fa-file",
                description: "New canvas [N]",
                tooltip: true,
                type: "click",
                hotkey: 'N',
                action: function(){
                    PaintTools.#instance.parent.canvas.clear();
                },
            },

            "undo": {
                icon: "fa-undo",
                description: "Undo [Z]",
                tooltip: true,
                type: "click",
                hotkey: 'Z',
                action: function(){
                    let self = PaintTools.#instance;

                    self.parent.restoreState(
                        self.parent.states.undo, 
                        self.parent.states.redo
                    );
                },
            },

            "redo": {
                icon: "fa-redo",
                description: "Redo [X]",
                tooltip: true,
                type: "click",
                hotkey: 'X',
                action: function(){
                    let self = PaintTools.#instance;

                    self.parent.restoreState(
                        self.parent.states.redo, 
                        self.parent.states.undo
                    );
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
        let self = PaintTools.#instance;
        let tools = self.items;

        let toolNames = Object.keys(tools);

        let toolsContainer = document.createElement('div');
        toolsContainer.classList = "tools__buttons-container";

        this.node.appendChild(this.pallete.node);
        this.node.appendChild(toolsContainer);


        toolNames.forEach(tool => {
            let toolElement = document.createElement('div');
            let toolIcon = document.createElement('i');
            let toolPrefix = 'tool_';

            toolElement.id = toolPrefix + tool;
            toolElement.setAttribute('items-type',  tools[tool].type);
            toolElement.appendChild(toolIcon);
            toolsContainer.appendChild(toolElement);

            tools[tool].node = toolElement;
            
            if(tools[tool].render) {
                toolElement.innerHTML = tools[tool].render;
            } else {
                toolIcon.classList = 'fa-solid ' + tools[tool].icon;
            }
            
            if(tools[tool].tooltip === true) {
                let a = tippy(toolElement, {
                    content: tools[tool].description,
                    arrow: false,
                    placement: 'right',
                    theme: 'cobalt',
                    offset: [0, 15],
                  });
            } else {
                toolElement.setAttribute('title',  tools[tool].description);
            }

            // use diff event to diff tool buttons types
            if(tools[tool].type === 'input'){
                toolElement.children[0].addEventListener('change', function(){
                    self.selectTool(tool);
                });
            } else {
                // actions by item clicking
                toolElement.addEventListener('click', function(){
                    self.selectTool(tool);
                });

                // adding hotkeys functionality
                document.addEventListener('keyup', event => {
                    let hotKey = 'Key' + tools[tool].hotkey;

                    if(event.code === hotKey) {
                        self.selectTool(tool);
                    }
                });
            }
        });
    }

    /**
     * Activates seleted tool.
     * @param {string} toolName 
     */
    selectTool(toolName){
        let self = PaintTools.#instance;
        let tools = self.items;
        let toolElement = tools[toolName].node;

        if(tools[toolName].type === 'input'){
             // clear input
             let raw_value = toolElement.children[0].value;
             let value = Number(raw_value.replace(/([a-zA-Z]|[а-яёА-ЯЁ]|\s)/gm, ''));

             tools[toolName].action(toolElement.children[0], value);
        } else {
            // execute tool action
            tools[toolName].action(toolElement);

            if(tools[toolName].type === "toggle"){
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
                    PaintTools.#instance.selected = toolName;
                }
            }
        }
    }

    #selectDefault(){
        let colors = this.node.children[0];
        let blackColor = colors.children[0];

        let tools = this.node.children[1];
        let brushTool = tools.children[1];
        let symmetryDrawningTool = tools.children[2];

        brushTool.click();
        blackColor.click();
        symmetryDrawningTool.click();
    }
}