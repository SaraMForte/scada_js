import { Refreshable, refreshLoop } from "./refreshable.js";
import TableManager from "./table-manager.js";

const datosProduccion = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', unidades: 50, estado: 'Pendiente' }
];

type TableViewControllerOptions = {
    tableId : string,
    rowsHeaders : {[headerName : string] : string}
    dataUrl : string
}

export default class TableViewController implements Refreshable {
    #tableManager
    #dataUrl

    constructor({tableId, rowsHeaders, dataUrl} : TableViewControllerOptions) {

        this.#tableManager = new TableManager(tableId, rowsHeaders)
        this.#dataUrl = dataUrl

        this.#tableManager.createTable()
    }

    async refresh() {
        this.#tableManager.refreshTable(datosProduccion)
    }

    async refreshLoop(loopTime : number) {
        await refreshLoop(this, loopTime)
    }
}