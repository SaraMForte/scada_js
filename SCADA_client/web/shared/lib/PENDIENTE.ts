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

//Composicion vs Herencia