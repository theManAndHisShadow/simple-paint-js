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