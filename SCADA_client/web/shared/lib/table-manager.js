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
var _TableManager_instances, _TableManager_tableId, _TableManager_getTableThead, _TableManager_getTableBody;
const datosProduccion = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', unidades: 50, estado: 'Pendiente' }
];
class TableManager {
    constructor(tableId) {
        _TableManager_instances.add(this);
        _TableManager_tableId.set(this, void 0);
        __classPrivateFieldSet(this, _TableManager_tableId, tableId, "f");
    }
    get tableId() {
        return __classPrivateFieldGet(this, _TableManager_tableId, "f");
    }
    createTable(rowsHeaders) {
        const table = document.getElementById(__classPrivateFieldGet(this, _TableManager_tableId, "f"));
        if (!table) {
            throw new Error(`The table with ID: ${__classPrivateFieldGet(this, _TableManager_tableId, "f")} not found`);
        }
        const tableThead = __classPrivateFieldGet(this, _TableManager_instances, "m", _TableManager_getTableThead).call(this, rowsHeaders);
        const tableBody = __classPrivateFieldGet(this, _TableManager_instances, "m", _TableManager_getTableBody).call(this, []);
        table.innerHTML = tableThead + tableBody;
    }
}
_TableManager_tableId = new WeakMap(), _TableManager_instances = new WeakSet(), _TableManager_getTableThead = function _TableManager_getTableThead(rowsHeaders) {
    if (!rowsHeaders.length) {
        throw new Error('Rows headers not found');
    }
    let tableThead = `<thead><tr>`;
    for (const rowHeader of rowsHeaders) {
        tableThead += `<th>${rowHeader}</th>`;
    }
    tableThead += `</tr></thead>`;
    return tableThead;
}, _TableManager_getTableBody = function _TableManager_getTableBody(dataBody) {
    if (!dataBody.length) {
        return `<tbody><tr></tr></tbody>`;
    }
    let tableBody = `<tbody><tr>`;
    for (const data of dataBody) {
        for (const [key, value] of Object.entries(data)) {
            tableBody += `<td>${value}</td>`;
        }
    }
    tableBody += `</tr></tbody>`;
    return tableBody;
};
export default TableManager;
