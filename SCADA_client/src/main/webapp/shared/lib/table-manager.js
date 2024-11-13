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
var _TableManager_instances, _TableManager_tableDoc, _TableManager_rowsHeaders, _TableManager_getTableThead, _TableManager_getTableBody;
class TableManager {
    constructor(tableId, rowsHeaders) {
        _TableManager_instances.add(this);
        _TableManager_tableDoc.set(this, void 0);
        _TableManager_rowsHeaders.set(this, void 0);
        const tableDoc = document.getElementById(tableId);
        if (!tableDoc) {
            throw new Error(`The table with ID: ${tableId} not found`);
        }
        const headerObj = Object.entries(rowsHeaders);
        if (!headerObj.length) {
            throw new Error('Rows headers not found');
        }
        __classPrivateFieldSet(this, _TableManager_tableDoc, tableDoc, "f");
        __classPrivateFieldSet(this, _TableManager_rowsHeaders, headerObj, "f");
    }
    get tableId() {
        return __classPrivateFieldGet(this, _TableManager_tableDoc, "f").id;
    }
    createTable() {
        const tableThead = __classPrivateFieldGet(this, _TableManager_instances, "m", _TableManager_getTableThead).call(this);
        const tableBody = __classPrivateFieldGet(this, _TableManager_instances, "m", _TableManager_getTableBody).call(this, []);
        __classPrivateFieldGet(this, _TableManager_tableDoc, "f").innerHTML = tableThead + tableBody;
    }
    refreshTable(dataBody) {
        __classPrivateFieldGet(this, _TableManager_tableDoc, "f").innerHTML = __classPrivateFieldGet(this, _TableManager_instances, "m", _TableManager_getTableBody).call(this, dataBody);
    }
}
_TableManager_tableDoc = new WeakMap(), _TableManager_rowsHeaders = new WeakMap(), _TableManager_instances = new WeakSet(), _TableManager_getTableThead = function _TableManager_getTableThead() {
    let tableThead = `<thead><tr>`;
    tableThead += __classPrivateFieldGet(this, _TableManager_rowsHeaders, "f").map(header => `<th>${header[1]}</th>`).join('');
    tableThead += `</tr></thead>`;
    return tableThead;
}, _TableManager_getTableBody = function _TableManager_getTableBody(dataBody) {
    if (!dataBody.length) {
        const rowHeaderLenght = __classPrivateFieldGet(this, _TableManager_rowsHeaders, "f").length;
        return `<tbody><tr><td colspan="${rowHeaderLenght}">Data not found</td></tr></tbody>`;
    }
    let tableBody = `<tbody>`;
    for (const data of dataBody) {
        tableBody += `<tr>`;
        tableBody += __classPrivateFieldGet(this, _TableManager_rowsHeaders, "f").map(rowContain => { var _a; return `<td>${(_a = data[rowContain[0]]) !== null && _a !== void 0 ? _a : 'N/A'}</td>`; }).join('');
        tableBody += `</tr>`;
    }
    tableBody += `</tbody>`;
    return tableBody;
};
export default TableManager;
