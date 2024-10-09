var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SvgTextManager_instances, _SvgTextManager_svgDoc, _SvgTextManager_changeTextContent, _SvgTextManager_updateTextGroup, _SvgTextManager_updateSvgText;
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
class SvgTextManager {
    constructor(idSvg) {
        _SvgTextManager_instances.add(this);
        _SvgTextManager_svgDoc.set(this, void 0);
        const svgObject = document.getElementById(idSvg);
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`);
        }
        __classPrivateFieldSet(this, _SvgTextManager_svgDoc, svgDoc, "f");
    }
    changeTextGroupContent(data) {
        data.forEach((texts, groupId) => {
            __classPrivateFieldGet(this, _SvgTextManager_instances, "m", _SvgTextManager_updateTextGroup).call(this, texts, groupId);
        });
    }
}
_SvgTextManager_svgDoc = new WeakMap(), _SvgTextManager_instances = new WeakSet(), _SvgTextManager_changeTextContent = function _SvgTextManager_changeTextContent(textId, dataValue) {
    const svgItem = __classPrivateFieldGet(this, _SvgTextManager_svgDoc, "f").getElementById(textId);
    if (!svgItem) {
        throw new Error(`Text with ID: ${textId} not found`);
    }
    if (typeof dataValue === 'number') {
        svgItem.textContent = dataValue;
    }
    else {
        svgItem.textContent = '####';
    }
}, _SvgTextManager_updateTextGroup = function _SvgTextManager_updateTextGroup(texts, groupId) {
    texts.forEach((value, className) => {
        __classPrivateFieldGet(this, _SvgTextManager_instances, "m", _SvgTextManager_updateSvgText).call(this, groupId, value, className);
    });
}, _SvgTextManager_updateSvgText = function _SvgTextManager_updateSvgText(groupId, value, className) {
    const svgText = __classPrivateFieldGet(this, _SvgTextManager_svgDoc, "f").querySelector(`#${groupId} > text.${className}.value1`);
    if (!svgText) {
        throw new Error(`The text for group ${groupId} with class name: ${className} was not found`);
    }
    svgText.textContent = value;
};
export default SvgTextManager;
