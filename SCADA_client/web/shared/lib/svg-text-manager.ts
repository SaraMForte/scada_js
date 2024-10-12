/**
 * @param groupId Identificador del grupo de texto en el SVG a modificar.
 * @param svgGroupText Mapa que asocia identificadores de clase con un valor.
 */
type TextGroup = {groupId : String, svgTextsOfTextGroup : Map<string, string>}

export default class SvgTextManager {
    #svgDoc

    constructor(svgDoc : Document) {
        this.#svgDoc = svgDoc
    }

    /**
     * Actualiza el contenido de los textos de todos los grupos de texto del SVG
     * @param dataTextGroups Datos de todos los grupos de texto
     */
    refreshTextContent(dataTextGroups : TextGroup[]) {
        dataTextGroups.forEach((textGroup) => {
            this.#changeTextGroupContent(textGroup)
        })
    }

    /**
     * Actualiza el contenido de los textos de todos las clases del grupo SVG
     * @param textGroup Datos del grupos de texto
     */
    #changeTextGroupContent(textGroup : TextGroup) {
        textGroup.svgTextsOfTextGroup.forEach((value, className) => {
            this.#updateSvgTextOfGroup(textGroup.groupId, className, value)
        })
    }

    /**
     * Actualiza el contenido del texto de una clase de un grupo SVG con un valor dado.
     * @param groupId Identificador del grupo de texto en el SVG a modificar.
     * @param textContent Contenido 
     * @param className Nombre de la clase del texto a modificar
     */
    #updateSvgTextOfGroup(groupId : String, className : string, textContent : string) {
        const svgText = this.#svgDoc.querySelector(`#${groupId} > text.${className}.value`) as SVGElement
        if (!svgText) {
            throw new Error(`The text for group ${groupId} with class name: ${className} value was not found`)
        }
        svgText.textContent = textContent
    }
}