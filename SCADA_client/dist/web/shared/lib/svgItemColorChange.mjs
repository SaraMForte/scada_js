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
var _SvgItemColorChanger_idSvg, _SvgItemColorChanger_colors;
const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark'];
class SvgItemColorChanger {
    constructor(idSvg, colors) {
        _SvgItemColorChanger_idSvg.set(this, void 0);
        _SvgItemColorChanger_colors.set(this, void 0);
        __classPrivateFieldSet(this, _SvgItemColorChanger_idSvg, idSvg, "f");
        __classPrivateFieldSet(this, _SvgItemColorChanger_colors, colors, "f");
    }
    changeItemColor(data, svgElementObj) {
        const svgObject = document.getElementById(__classPrivateFieldGet(this, _SvgItemColorChanger_idSvg, "f"));
        const svgDoc = svgObject === null || svgObject === void 0 ? void 0 : svgObject.contentDocument;
        if (svgDoc) {
            for (const element in svgElementObj) {
                const valueItem = data[svgElementObj[element].valueKey];
                const valueWarn = data[svgElementObj[element].warnValueKey];
                const valueForce = data[svgElementObj[element].forceValueKey];
                const choosedColor = this.chooseColor(valueItem, valueWarn);
                for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
                    this.changesSubElementColor(svgDoc, element + CHILD_SVG_NAMES[i], choosedColor[i]);
                }
                this.updateSvgVisibilityInTopRight(svgDoc, element, valueForce);
            }
        }
    }
    chooseColor(valueItem, valueWarn) {
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
    }
    changesSubElementColor(svgDoc, subelementId, choosedColor) {
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
    updateSvgVisibilityInTopRight(svgDoc, svgElement, valueForce) {
        const svgSymbol = document.getElementById(svgElement + '-force');
        if (svgSymbol) {
            svgSymbol.style.visibility = valueForce === 1 ? 'visible' : 'hidden';
        }
        else {
            const objectElement = document.createElement('object');
            const gettedElement = svgDoc.getElementById(svgElement);
            const boundingBox = gettedElement === null || gettedElement === void 0 ? void 0 : gettedElement.getBoundingClientRect();
            objectElement.setAttribute('data', '/shared/svg-force-symbol.svg');
            objectElement.setAttribute('type', 'image/svg+xml');
            objectElement.setAttribute('id', svgElement + '-force');
            objectElement.setAttribute('style', `position:absolute; x:${boundingBox === null || boundingBox === void 0 ? void 0 : boundingBox.left} ; y:${boundingBox === null || boundingBox === void 0 ? void 0 : boundingBox.top} ; width:10px ; height:10px`);
            const container = document.getElementById('force-symbols');
            container === null || container === void 0 ? void 0 : container.appendChild(objectElement);
        }
    }
}
_SvgItemColorChanger_idSvg = new WeakMap(), _SvgItemColorChanger_colors = new WeakMap();
export default SvgItemColorChanger;
