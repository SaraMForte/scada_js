/**
 * Cambiar los valores de los elementos en texto según un valor dado
 * @param idSvg el id del SVG a modificar
 * @param idItemSvg el id en el SVG del elemento a modificar
 * @param dataValue el valor que determina el color del elemento
 */
export function changeTextContent(idSvg, idItemSvg, dataValue) {
    const svgObject = document.getElementById(idSvg);
    if (svgObject) {
        const svgDoc = svgObject.contentDocument;
        const svgItem = svgDoc === null || svgDoc === void 0 ? void 0 : svgDoc.getElementById(idItemSvg);
        if (svgItem) {
            if (typeof dataValue === 'number') {
                svgItem.textContent = dataValue + ' L';
            }
            else {
                svgItem.textContent = '#### L';
            }
        }
    }
}
