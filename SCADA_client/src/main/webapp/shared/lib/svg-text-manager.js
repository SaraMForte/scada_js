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
var _SvgTextManager_instances, _SvgTextManager_svgDoc, _SvgTextManager_changeTextGroupContent, _SvgTextManager_updateSvgTextOfGroup;
class SvgTextManager {
    constructor(svgDoc) {
        _SvgTextManager_instances.add(this);
        _SvgTextManager_svgDoc.set(this, void 0);
        __classPrivateFieldSet(this, _SvgTextManager_svgDoc, svgDoc, "f");
    }
    /**
     * Actualiza el contenido de los textos de todos los grupos de texto del SVG
     * @param dataTextGroups Datos de todos los grupos de texto
     */
    refreshTextContent(dataTextGroups) {
        dataTextGroups.forEach((textGroup) => {
            __classPrivateFieldGet(this, _SvgTextManager_instances, "m", _SvgTextManager_changeTextGroupContent).call(this, textGroup);
        });
    }
}
_SvgTextManager_svgDoc = new WeakMap(), _SvgTextManager_instances = new WeakSet(), _SvgTextManager_changeTextGroupContent = function _SvgTextManager_changeTextGroupContent(textGroup) {
    textGroup.svgTextsOfTextGroup.forEach((value, className) => {
        __classPrivateFieldGet(this, _SvgTextManager_instances, "m", _SvgTextManager_updateSvgTextOfGroup).call(this, textGroup.groupId, className, value);
    });
}, _SvgTextManager_updateSvgTextOfGroup = function _SvgTextManager_updateSvgTextOfGroup(groupId, className, textContent) {
    const svgText = __classPrivateFieldGet(this, _SvgTextManager_svgDoc, "f").querySelector(`#${groupId} > text.${className}.value`);
    if (!svgText) {
        throw new Error(`The text for group ${groupId} with class name: ${className} value was not found`);
    }
    svgText.textContent = textContent;
};
export default SvgTextManager;
