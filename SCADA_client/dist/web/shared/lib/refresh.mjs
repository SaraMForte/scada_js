/**
 * Cambia el color del elemento del SVG segun un valor dado
 * @param idSvg el id del SVG a modificar
 * @param idItemSvg el id en el SVG del elemento a modificar
 * @param dataValue el valor que determina el color del elemento
 * @param colors los colores que podra tener el elemento
 */
export function changeColor(idSvg, idItemSvg, dataValue, colors) {
    const svgObject = document.getElementById(idSvg);
    const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
    if (svgDoc) {
        const childSvgNames = ['-fill', '-light', '-medium', '-dark'];
        const choosedColor = chooseColor(dataValue, colors);
        for (let i = 0; i < childSvgNames.length; i++) {
            changesSubelementColor(svgDoc, idItemSvg + childSvgNames[i], choosedColor[i]);
        }
    }
}
/**
 * Cambiar el color del elemento o elementos del SVG
 * @param svgDoc el objeto SVG
 * @param subelementId nombre del elemento del que cambia de color
 * @param choosedColor color al que cambia
 */
function changesSubelementColor(svgDoc, subelementId, choosedColor) {
    const svgItem = svgDoc === null || svgDoc === void 0 ? void 0 : svgDoc.getElementById(subelementId);
    const svgGroupItems = (svgItem === null || svgItem === void 0 ? void 0 : svgItem.tagName) === 'g'
        ? svgItem.querySelectorAll('*')
        : [svgItem];
    svgGroupItems.forEach((element) => {
        if (element) {
            element.style.fill = choosedColor;
        }
    });
}
/**
 * Determina los colores que tendrá el elemento
 * @param dataValue el valor que determina el color del elemento
 * @param colors los colores que podra tener el elemento
 * @returns devuelve un Array de colores para el elemento
 */
function chooseColor(dataValue, colors) {
    if (typeof dataValue === 'string' || dataValue === 2) { // EL DATAVALUE === 2 ES SOLO PARA TESTEOS DE WARNS !!!!!!!!!!!!!!!!!!!
        return colors.WARN;
    }
    if (dataValue === 1) {
        return colors.ON;
    }
    if (dataValue === 0) {
        return colors.OFF;
    }
    throw new Error('Unknown value ' + dataValue);
}
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
