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
var _SvgItemManager_svgDoc, _SvgItemManager_colors, _RefreshItemsStatusContext_instances, _RefreshItemsStatusContext_data, _RefreshItemsStatusContext_scadaSvgItemsKeys, _RefreshItemsStatusContext_colors, _RefreshItemsStatusContext_svgDoc, _RefreshItemsStatusContext_chooseColor, _RefreshItemsStatusContext_changesItemFragmentColor;
const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark'];
/**
 * Clase que controla las propiedades de los items internos del SVG
 */
class SvgItemManager {
    /**
     * @param idSvg El ID correspondiente al SVG a controlar en el html
     * @param colors Los colores que se aplican según el estado del item interno del SVG
     */
    constructor(idSvg, colors) {
        _SvgItemManager_svgDoc.set(this, void 0);
        _SvgItemManager_colors.set(this, void 0);
        const svgObject = document.getElementById(idSvg);
        const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
        if (!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`);
        }
        __classPrivateFieldSet(this, _SvgItemManager_svgDoc, svgDoc, "f");
        __classPrivateFieldSet(this, _SvgItemManager_colors, colors, "f");
    }
    /**
     * Actualiza el estado de los items internos del SVG
     * @param data Los datos que contiene el estado de los items
     * @param scadaSvgItemsKeys Las claves o IDs de los items internos del SVG y las claves para la busqueda de su estado
     */
    refreshItemsStatus(data, scadaSvgItemsKeys) {
        const refreshItemsStatusContext = new RefreshItemsStatusContext(data, scadaSvgItemsKeys, __classPrivateFieldGet(this, _SvgItemManager_svgDoc, "f"), __classPrivateFieldGet(this, _SvgItemManager_colors, "f"));
        for (const itemId in scadaSvgItemsKeys) {
            const svgItem = __classPrivateFieldGet(this, _SvgItemManager_svgDoc, "f").getElementById(itemId);
            if (!svgItem) {
                throw new Error(`Element with ID: ${itemId} not found`);
            }
            refreshItemsStatusContext.changeItemColor(itemId);
            refreshItemsStatusContext.updateSymbolForceVisibility(svgItem);
        }
    }
}
_SvgItemManager_svgDoc = new WeakMap(), _SvgItemManager_colors = new WeakMap();
export default SvgItemManager;
/**
 * Clase que contiene los métodos del contexto de refreshItemStatus
 */
class RefreshItemsStatusContext {
    /**
     *
     * @param data Los datos que contiene el estado de los items
     * @param scadaSvgItemsKeys Las claves o IDs de los items internos del SVG y las claves para la busqueda de su estado
     * @param svgDoc Documento del DOM que contiene el SVG
     * @param colors Los colores que se aplican según el estado del item interno del SVG
     */
    constructor(data, scadaSvgItemsKeys, svgDoc, colors) {
        _RefreshItemsStatusContext_instances.add(this);
        _RefreshItemsStatusContext_data.set(this, void 0);
        _RefreshItemsStatusContext_scadaSvgItemsKeys.set(this, void 0);
        _RefreshItemsStatusContext_colors.set(this, void 0);
        _RefreshItemsStatusContext_svgDoc.set(this, void 0);
        __classPrivateFieldSet(this, _RefreshItemsStatusContext_data, data, "f");
        __classPrivateFieldSet(this, _RefreshItemsStatusContext_scadaSvgItemsKeys, scadaSvgItemsKeys, "f");
        __classPrivateFieldSet(this, _RefreshItemsStatusContext_svgDoc, svgDoc, "f");
        __classPrivateFieldSet(this, _RefreshItemsStatusContext_colors, colors, "f");
    }
    /**
     * Cambia el color o colores del item
     * @param itemId Id de del item que cambiará de color
     */
    changeItemColor(itemId) {
        const valueItem = __classPrivateFieldGet(this, _RefreshItemsStatusContext_data, "f")[__classPrivateFieldGet(this, _RefreshItemsStatusContext_scadaSvgItemsKeys, "f")[itemId].valueKey];
        const valueWarn = __classPrivateFieldGet(this, _RefreshItemsStatusContext_data, "f")[__classPrivateFieldGet(this, _RefreshItemsStatusContext_scadaSvgItemsKeys, "f")[itemId].warnValueKey];
        const choosedColor = __classPrivateFieldGet(this, _RefreshItemsStatusContext_instances, "m", _RefreshItemsStatusContext_chooseColor).call(this, valueItem, valueWarn);
        for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
            __classPrivateFieldGet(this, _RefreshItemsStatusContext_instances, "m", _RefreshItemsStatusContext_changesItemFragmentColor).call(this, itemId + CHILD_SVG_NAMES[i], choosedColor[i]);
        }
    }
    /**
     * Actualiza la visibilidad del simbolo de forzado asociado a un item o lo añade
     * @param svgItem elemento grafico del SVG al que se añade el simbolo de forzado
     */
    updateSymbolForceVisibility(svgItem) {
        const tagUse = __classPrivateFieldGet(this, _RefreshItemsStatusContext_svgDoc, "f").getElementById(svgItem.id + '-force');
        if (tagUse) {
            const forceDataValue = __classPrivateFieldGet(this, _RefreshItemsStatusContext_data, "f")[__classPrivateFieldGet(this, _RefreshItemsStatusContext_scadaSvgItemsKeys, "f")[svgItem.id].forceValueKey];
            tagUse.style.visibility = forceDataValue ? 'visible' : 'hidden';
        }
        else {
            const boundOfUse = svgItem === null || svgItem === void 0 ? void 0 : svgItem.getBBox();
            const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
            tagUse.setAttribute("href", "/shared/element-force.svg#force-symbol");
            tagUse.setAttribute("id", `${svgItem.id}-force`);
            tagUse.setAttribute("x", `${(boundOfUse === null || boundOfUse === void 0 ? void 0 : boundOfUse.width) - 10}`); //-10 perfect right
            tagUse.setAttribute("y", `-10`);
            tagUse.setAttribute("width", "20");
            tagUse.setAttribute("height", "20");
            svgItem === null || svgItem === void 0 ? void 0 : svgItem.appendChild(tagUse);
        }
    }
}
_RefreshItemsStatusContext_data = new WeakMap(), _RefreshItemsStatusContext_scadaSvgItemsKeys = new WeakMap(), _RefreshItemsStatusContext_colors = new WeakMap(), _RefreshItemsStatusContext_svgDoc = new WeakMap(), _RefreshItemsStatusContext_instances = new WeakSet(), _RefreshItemsStatusContext_chooseColor = function _RefreshItemsStatusContext_chooseColor(valueItem, valueWarn) {
    if (valueWarn === 1) {
        return __classPrivateFieldGet(this, _RefreshItemsStatusContext_colors, "f").WARN;
    }
    if (valueItem === 1) {
        return __classPrivateFieldGet(this, _RefreshItemsStatusContext_colors, "f").ON;
    }
    if (valueItem === 0) {
        return __classPrivateFieldGet(this, _RefreshItemsStatusContext_colors, "f").OFF;
    }
    throw new Error(`Unknown value of valueItem: ${valueWarn} and valueWarn: ${valueItem}`);
}, _RefreshItemsStatusContext_changesItemFragmentColor = function _RefreshItemsStatusContext_changesItemFragmentColor(itemFrangmentId, choosedColor) {
    var _a;
    const svgItem = (_a = __classPrivateFieldGet(this, _RefreshItemsStatusContext_svgDoc, "f")) === null || _a === void 0 ? void 0 : _a.getElementById(itemFrangmentId);
    const svgGroupItems = (svgItem === null || svgItem === void 0 ? void 0 : svgItem.tagName) === 'g'
        ? svgItem.querySelectorAll('*')
        : [svgItem];
    svgGroupItems.forEach((element) => {
        if (element) {
            element.style.fill = choosedColor;
        }
    });
};
