export function setClickable(idSvg, idItemSvg, callback) {
    const svgObject = document.getElementById(idSvg);
    const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
    if (!svgDoc) {
        throw new Error(`No content document found for SVG with ID: ${idSvg}`);
    }
    selectableObjectIndicator(svgDoc, idItemSvg);
    const svgItem = svgDoc.getElementById(idItemSvg);
    if (!svgItem) {
        throw new Error(`No SVG Item found with ID: ${idItemSvg}`);
    }
    svgItem === null || svgItem === void 0 ? void 0 : svgItem.addEventListener("click", callback);
}
/**
 * Establece como se indica que un elemento es clickable
 * @param svgDoc el objeto SVG
 * @param idItemSvg subelemento clickable
 */
function selectableObjectIndicator(svgDoc, idItemSvg) {
    const svgItem = svgDoc.getElementById(idItemSvg);
    if (!svgItem) {
        throw new Error(`No SVG Item found with ID: ${idItemSvg}`);
    }
    svgItem.style.cursor = "pointer";
    svgItem.addEventListener("mouseover", () => {
        svgItem.setAttribute('stroke', 'white');
    });
    svgItem.addEventListener("mouseout", () => {
        svgItem.removeAttribute("stroke");
    });
}
