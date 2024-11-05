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
var _SvgItemViewController_svgItemManager, _SvgItemViewController_dataUrl, _SvgItemViewController_svgItemsKeys;
import { refreshLoop } from "./refreshable.js";
import SvgItemManager from "./svg-item-manager.js";
class SvgItemViewController {
    constructor({ idSvg, colors, dataUrl, svgItemsKeys }) {
        _SvgItemViewController_svgItemManager.set(this, void 0);
        _SvgItemViewController_dataUrl.set(this, void 0);
        _SvgItemViewController_svgItemsKeys.set(this, void 0);
        __classPrivateFieldSet(this, _SvgItemViewController_svgItemManager, new SvgItemManager(idSvg, colors), "f");
        __classPrivateFieldSet(this, _SvgItemViewController_dataUrl, dataUrl, "f");
        __classPrivateFieldSet(this, _SvgItemViewController_svgItemsKeys, svgItemsKeys, "f");
    }
    /**
     * Se conectará con el servidor para actualizar los elementos de la pantalla
     */
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield fetch(__classPrivateFieldGet(this, _SvgItemViewController_dataUrl, "f"));
            const data = yield response.json();
            console.log(data);
            __classPrivateFieldGet(this, _SvgItemViewController_svgItemManager, "f").refreshItemsStatus(data, __classPrivateFieldGet(this, _SvgItemViewController_svgItemsKeys, "f"));
        });
    }
    /**
     * Función que establece el bucle de la función refresh
     */
    refreshLoop(loopTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield refreshLoop(this, loopTime);
        });
    }
    initializeOnce() {
        __classPrivateFieldGet(this, _SvgItemViewController_svgItemManager, "f").setItemsClickables(__classPrivateFieldGet(this, _SvgItemViewController_svgItemsKeys, "f"), () => { });
    }
}
_SvgItemViewController_svgItemManager = new WeakMap(), _SvgItemViewController_dataUrl = new WeakMap(), _SvgItemViewController_svgItemsKeys = new WeakMap();
export default SvgItemViewController;
