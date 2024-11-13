var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
var _SvgTextViewController_svgTextManager, _SvgTextViewController_dataUrl;
import { refreshLoop } from "./refreshable.js";
import SvgTextManager from "./svg-text-manager.js";
const data = [
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['volumen', '100 L']]) },
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['capacidad', '2000 Kg']]) }
];
class SvgTextViewController {
    constructor({ idSvg, dataUrl }) {
        _SvgTextViewController_svgTextManager.set(this, void 0);
        _SvgTextViewController_dataUrl.set(this, void 0);
        const svgObject = document.getElementById(idSvg);
        const svgDoc = svgObject.contentDocument;
        if (!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`);
        }
        const svgTextManager = new SvgTextManager(svgDoc);
        __classPrivateFieldSet(this, _SvgTextViewController_svgTextManager, svgTextManager, "f");
        __classPrivateFieldSet(this, _SvgTextViewController_dataUrl, dataUrl, "f");
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            // const response = await fetch(this.#dataUrl)
            // const data = await response.json()
            __classPrivateFieldGet(this, _SvgTextViewController_svgTextManager, "f").refreshTextContent(data);
        });
    }
    refreshLoop(loopTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield refreshLoop(this, loopTime);
        });
    }
}
_SvgTextViewController_svgTextManager = new WeakMap(), _SvgTextViewController_dataUrl = new WeakMap();
export default SvgTextViewController;
