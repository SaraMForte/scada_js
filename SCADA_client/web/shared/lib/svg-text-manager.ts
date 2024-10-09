
type svgTextsGroupsKeys = Map<string, svgTextsKeys>
type svgTextsKeys = Map<string , string>

/**
 * Cambiar los valores de los elementos en texto según un valor dado
 * @param idSvg el id del SVG a modificar
 * @param idItemSvg el id en el SVG del elemento a modificar
 * @param dataValue el valor que determina el color del elemento
 */
export function changeTextContent(idSvg: string, idItemSvg: string, dataValue: number) {
    const svgObject = document.getElementById(idSvg) as HTMLObjectElement

    if (svgObject) {
        const svgDoc = svgObject.contentDocument
        const svgItem = svgDoc?.getElementById(idItemSvg)

        if (svgItem) {
            if (typeof dataValue === 'number') {
                svgItem.textContent = dataValue + ' L'
            } 
            else {
                svgItem.textContent = '#### L'
            }
        }
    }
}

export default class SvgTextManager {
    #svgDoc

    constructor(idSvg: string) {
        const svgObject = document.getElementById(idSvg) as HTMLObjectElement
        const svgDoc = svgObject.contentDocument
        if(!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`)
        }

        this.#svgDoc = svgDoc
    }

    /**
     * Actualiza el contenido de un elemento de texto en un SVG con un valor dado.
     * @param textId  Identificador del elemento de texto en el SVG a modificar.
     * @param dataValue  Valor con el que se actualizará el contenido del texto.
     * @param unit  Unidad del valor a mostrar junto al contenido actualizado.
     */
    #changeTextContent(textId : string, dataValue : string) {
        const svgItem = this.#svgDoc.getElementById(textId)

        if(!svgItem) {
            throw new Error(`Text with ID: ${textId} not found`)
        }

        if(typeof dataValue === 'number') {
            svgItem.textContent = dataValue
        }
        else {
            svgItem.textContent = '####'
        }
    }

    changeTextGroupContent(data : svgTextsGroupsKeys) {
        data.forEach((texts, groupId) => {
           this.#updateTextGroup(texts, groupId)
        })
    }

    #updateTextGroup(texts : svgTextsKeys, groupId : string) {
        texts.forEach((value, className) => {
            this.#updateSvgText(groupId, value, className)
        })
    }

    #updateSvgText(groupId : String, value : string, className : string) {
        const svgText = this.#svgDoc.querySelector(`#${groupId} > text.${className}.value1`) as SVGElement
        if (!svgText) {
            throw new Error(`The text for group ${groupId} with class name: ${className} was not found`)
        }
        svgText.textContent = value
    }
}