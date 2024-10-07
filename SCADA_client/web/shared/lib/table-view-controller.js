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
var _TableViewController_tableManager, _TableViewController_dataUrl;
import { refreshLoop } from "./refreshable.js";
import TableManager from "./table-manager.js";
const datosProduccion = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', unidades: 50, estado: 'Pendiente' }
];
class TableViewController {
    constructor({ tableId, rowsHeaders, dataUrl }) {
        _TableViewController_tableManager.set(this, void 0);
        _TableViewController_dataUrl.set(this, void 0);
        __classPrivateFieldSet(this, _TableViewController_tableManager, new TableManager(tableId, rowsHeaders), "f");
        __classPrivateFieldSet(this, _TableViewController_dataUrl, dataUrl, "f");
        __classPrivateFieldGet(this, _TableViewController_tableManager, "f").createTable();
    }
    refresh() {
        return __awaiter(this, void 0, void 0, function* () {
            __classPrivateFieldGet(this, _TableViewController_tableManager, "f").refreshTable(datosProduccion);
        });
    }
    refreshLoop(loopTime) {
        return __awaiter(this, void 0, void 0, function* () {
            yield refreshLoop(this, loopTime);
        });
    }
}
_TableViewController_tableManager = new WeakMap(), _TableViewController_dataUrl = new WeakMap();
export default TableViewController;
