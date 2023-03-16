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

        
        this.colors = [
            {
                black: 'black',
                "dark-red": '#780c0c',
                "dark-orange": '#6a2712',
                "dark-yellow":' #8d6b06',
                "dark-green": '#224e24',
                "dark-blue": '#114976',
                "dark-violet": '#371f62',
                "dark-gray": '#929292',
            },
            {
                "dark-gray": '#454545',
                red: '#e91e1e',
                orange: '#ff5722',
                yellow: '#ffc107',
                green: '#4caf50',
                blue: '#2196f3',
                violet: '#673ab7',
                white: 'white'
            },
            {
                "gray": '#757575',
                "light-red": '#db5a5a',
                "light-orange": '#ff8761',
                "light-yellow":' #ffd450',
                "light-green": '#75b277',
                "light-blue": '#6bc9d5',
                "light-violet": '#9575cd',
                "light-gray":'#d7d5d5',
            }
        ]

        this.node = this.#create();
        
        this.selected = 'black';
    }

    /**
     * Emulates user color selecting.
     * @param {string} color hex
     */
    emulateSelecting(color){
        let selector = `[data-color-value="${color}"]`;
        let colorElement = document.querySelector(selector);
        
        colorElement.click();
    }

    #create(){
        const paletteContainer = document.createElement('div');
        paletteContainer.classList = 'tools__palette-container';

        const self =  PaintColorPalette.#instance;
        const columns = self.colors;
        
        columns.forEach((column, i) => {
            let columnColor = Object.keys(column);

            const columnElement = document.createElement('div');
            columnElement.classList.add('palette-container__column');

            columnColor.forEach(color => {
                let colorElement = document.createElement('div');
                colorElement.setAttribute('data-type', 'toggle');
                colorElement.setAttribute('title', 'Color ' + color);
                colorElement.setAttribute('data-color-value', column[color]);
    
                colorElement.style = `background: ${column[color]}`;
                
                columnElement.appendChild(colorElement);
    
                colorElement.addEventListener('click', function(){
                   if(self.parent.selected === "brush"){
                        self.selected = column[color];
                        self.parent.parent.brush.setColor(column[color]);
    
                        let className = 'selected__color';
    
                        // get all selected color
                        let allSelected = Array.from(document.getElementsByClassName(className));
    
                        // de-select all
                        allSelected.forEach(selected => { selected.classList.remove(className)});
    
                        // select color by clicking
                        // let selected = colorElement.classList.contains(className);
                        // colorElement.classList.add(className);
                   }
                });
            });

            paletteContainer.appendChild(columnElement);
        });

        return paletteContainer;
    }
}