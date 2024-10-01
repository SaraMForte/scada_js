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
var _SvgItemColorChanger_instances, _SvgItemColorChanger_idSvg, _SvgItemColorChanger_colors, _SvgItemColorChanger_chooseColor, _SvgItemColorChanger_changesSubElementColor, _SvgItemColorChanger_updateSymbolForceVisibility;
const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark'];
class SvgItemColorChanger {
    constructor(idSvg, colors) {
        _SvgItemColorChanger_instances.add(this);
        _SvgItemColorChanger_idSvg.set(this, void 0);
        _SvgItemColorChanger_colors.set(this, void 0);
        __classPrivateFieldSet(this, _SvgItemColorChanger_idSvg, idSvg, "f");
        __classPrivateFieldSet(this, _SvgItemColorChanger_colors, colors, "f");
    }
    changeItemColor(data, svgElementObj) {
        const svgObject = document.getElementById(__classPrivateFieldGet(this, _SvgItemColorChanger_idSvg, "f"));
        const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
        if (svgDoc) {
            for (const itemFrangmentId in svgElementObj) {
                const svgItemFrangment = svgDoc.getElementById(itemFrangmentId);
                if (svgItemFrangment) {
                    const valueItem = data[svgElementObj[itemFrangmentId].valueKey];
                    const valueWarn = data[svgElementObj[itemFrangmentId].warnValueKey];
                    const valueForce = data[svgElementObj[itemFrangmentId].forceValueKey];
                    const choosedColor = __classPrivateFieldGet(this, _SvgItemColorChanger_instances, "m", _SvgItemColorChanger_chooseColor).call(this, valueItem, valueWarn);
                    for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
                        __classPrivateFieldGet(this, _SvgItemColorChanger_instances, "m", _SvgItemColorChanger_changesSubElementColor).call(this, svgDoc, itemFrangmentId + CHILD_SVG_NAMES[i], choosedColor[i]);
                    }
                    __classPrivateFieldGet(this, _SvgItemColorChanger_instances, "m", _SvgItemColorChanger_updateSymbolForceVisibility).call(this, svgDoc, itemFrangmentId, valueForce);
                }
                else {
                    throw new Error(`Element not found with ID: ${svgItemFrangment}`);
                }
            }
        }
    }
}
_SvgItemColorChanger_idSvg = new WeakMap(), _SvgItemColorChanger_colors = new WeakMap(), _SvgItemColorChanger_instances = new WeakSet(), _SvgItemColorChanger_chooseColor = function _SvgItemColorChanger_chooseColor(valueItem, valueWarn) {
    if (valueWarn === 1) {
        return __classPrivateFieldGet(this, _SvgItemColorChanger_colors, "f").WARN;
    }
    if (valueItem === 1) {
        return __classPrivateFieldGet(this, _SvgItemColorChanger_colors, "f").ON;
    }
    if (valueItem === 0) {
        return __classPrivateFieldGet(this, _SvgItemColorChanger_colors, "f").OFF;
    }
    throw new Error(`Unknown value of valueItem: ${valueWarn} and valueWarn: ${valueItem}`);
}, _SvgItemColorChanger_changesSubElementColor = function _SvgItemColorChanger_changesSubElementColor(svgDoc, subelementId, choosedColor) {
    const svgItem = svgDoc === null || svgDoc === void 0 ? void 0 : svgDoc.getElementById(subelementId);
    const svgGroupItems = (svgItem === null || svgItem === void 0 ? void 0 : svgItem.tagName) === 'g'
        ? svgItem.querySelectorAll('*')
        : [svgItem];
    svgGroupItems.forEach((element) => {
        if (element) {
            element.style.fill = choosedColor;
        }
    });
}, _SvgItemColorChanger_updateSymbolForceVisibility = function _SvgItemColorChanger_updateSymbolForceVisibility(svgDoc, svgElement, valueForce) {
    const tagUse = svgDoc.getElementById(svgElement + '-force');
    console.log(arguments);
    console.log(tagUse);
    if (tagUse) {
        tagUse.style.visibility = valueForce === 1 ? 'visible' : 'hidden';
    }
    else {
        const tagGroup = svgDoc === null || svgDoc === void 0 ? void 0 : svgDoc.getElementById(svgElement);
        const boundOfUse = tagGroup === null || tagGroup === void 0 ? void 0 : tagGroup.getBoundingClientRect();
        const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use");
        tagUse.setAttribute("href", "/shared/element-force.svg#force-symbol");
        tagUse.setAttribute("id", `${svgElement}-force`);
        tagUse.setAttribute("x", `-10`); //-10 perfect right
        tagUse.setAttribute("y", `-10`);
        tagUse.setAttribute("width", "20");
        tagUse.setAttribute("height", "20");
        tagGroup === null || tagGroup === void 0 ? void 0 : tagGroup.appendChild(tagUse);
    }
};
export default SvgItemColorChanger;
