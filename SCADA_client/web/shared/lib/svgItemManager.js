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
var _SvgItemManager_instances, _SvgItemManager_colors, _SvgItemManager_svgDoc, _SvgItemManager_changeItemColor, _SvgItemManager_chooseColor, _SvgItemManager_changesItemFragmentColor, _SvgItemManager_updateSymbolForceVisibility;
const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark'];
class SvgItemManager {
    constructor(idSvg, colors) {
        _SvgItemManager_instances.add(this);
        _SvgItemManager_colors.set(this, void 0);
        _SvgItemManager_svgDoc.set(this, void 0);
        const svgObject = document.getElementById(idSvg);
        const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
        if (!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`);
        }
        __classPrivateFieldSet(this, _SvgItemManager_svgDoc, svgDoc, "f");
        __classPrivateFieldSet(this, _SvgItemManager_colors, colors, "f");
    }
    refreshItemsStatus(data, scadaSvgItemKeys) {
        for (const itemFrangmentId in scadaSvgItemKeys) {
            const svgItemFrangment = __classPrivateFieldGet(this, _SvgItemManager_svgDoc, "f").getElementById(itemFrangmentId);
            if (!svgItemFrangment) {
                throw new Error(`Element with ID: ${itemFrangmentId} not found`);
            }
            __classPrivateFieldGet(this, _SvgItemManager_instances, "m", _SvgItemManager_changeItemColor).call(this, data, scadaSvgItemKeys[itemFrangmentId], itemFrangmentId);
            __classPrivateFieldGet(this, _SvgItemManager_instances, "m", _SvgItemManager_updateSymbolForceVisibility).call(this, data, scadaSvgItemKeys[itemFrangmentId], svgItemFrangment, itemFrangmentId);
        }
    }
}
_SvgItemManager_colors = new WeakMap(), _SvgItemManager_svgDoc = new WeakMap(), _SvgItemManager_instances = new WeakSet(), _SvgItemManager_changeItemColor = function _SvgItemManager_changeItemColor(data, svgElementObjValues, itemFrangmentId) {
    const valueItem = data[svgElementObjValues.valueKey];
    const valueWarn = data[svgElementObjValues.warnValueKey];
    const choosedColor = __classPrivateFieldGet(this, _SvgItemManager_instances, "m", _SvgItemManager_chooseColor).call(this, valueItem, valueWarn);
    for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
        __classPrivateFieldGet(this, _SvgItemManager_instances, "m", _SvgItemManager_changesItemFragmentColor).call(this, itemFrangmentId + CHILD_SVG_NAMES[i], choosedColor[i]);
    }
}, _SvgItemManager_chooseColor = function _SvgItemManager_chooseColor(valueItem, valueWarn) {
    if (valueWarn === 1) {
        return __classPrivateFieldGet(this, _SvgItemManager_colors, "f").WARN;
    }
    if (valueItem === 1) {
        return __classPrivateFieldGet(this, _SvgItemManager_colors, "f").ON;
    }
    if (valueItem === 0) {
        return __classPrivateFieldGet(this, _SvgItemManager_colors, "f").OFF;
    }
    throw new Error(`Unknown value of valueItem: ${valueWarn} and valueWarn: ${valueItem}`);
}, _SvgItemManager_changesItemFragmentColor = function _SvgItemManager_changesItemFragmentColor(itemFrangmentId, choosedColor) {
    var _a;
    const svgItem = (_a = __classPrivateFieldGet(this, _SvgItemManager_svgDoc, "f")) === null || _a === void 0 ? void 0 : _a.getElementById(itemFrangmentId);
    const svgGroupItems = (svgItem === null || svgItem === void 0 ? void 0 : svgItem.tagName) === 'g'
        ? svgItem.querySelectorAll('*')
        : [svgItem];
    svgGroupItems.forEach((element) => {
        if (element) {
            element.style.fill = choosedColor;
        }
    });
}, _SvgItemManager_updateSymbolForceVisibility = function _SvgItemManager_updateSymbolForceVisibility(data, svgElementObj, svgItemFrangment, itemFrangmentId) {
    const tagUse = __classPrivateFieldGet(this, _SvgItemManager_svgDoc, "f").getElementById(itemFrangmentId + '-force');
    if (tagUse) {
        tagUse.style.visibility = data[svgElementObj.forceValueKey] ? 'visible' : 'hidden';
    }
    else {
        const boundOfUse = svgItemFrangment === null || svgItemFrangment === void 0 ? void 0 : svgItemFrangment.getBBox();
        const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
        tagUse.setAttribute("href", "/shared/element-force.svg#force-symbol");
        tagUse.setAttribute("id", `${itemFrangmentId}-force`);
        tagUse.setAttribute("x", `${(boundOfUse === null || boundOfUse === void 0 ? void 0 : boundOfUse.width) - 10}`); //-10 perfect right
        tagUse.setAttribute("y", `-10`);
        tagUse.setAttribute("width", "20");
        tagUse.setAttribute("height", "20");
        svgItemFrangment === null || svgItemFrangment === void 0 ? void 0 : svgItemFrangment.appendChild(tagUse);
    }
};
export default SvgItemManager;
