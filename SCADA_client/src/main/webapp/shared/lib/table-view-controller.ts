import { Refreshable, refreshLoop } from './refreshable.js'
import TableManager from './table-manager.js'

// const datosProduccion = [
//     { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
//     { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
//     { producto: 'Producto C', unidades: 50, estado: 'Pendiente' }
// ]

type TableViewControllerOptions = {
    tableId: string
    rowsHeaders: { [headerName: string]: string }
    dataUrl: string
}

export default class TableViewController implements Refreshable {
    isRefreshLoopStopped: boolean
    #tableManager
    #dataUrl

    constructor({ tableId, rowsHeaders, dataUrl }: TableViewControllerOptions) {
        this.#tableManager = new TableManager(tableId, rowsHeaders)
        this.#dataUrl = dataUrl
        this.#tableManager.createTable()
        this.isRefreshLoopStopped = true
    }

    stopRefreshLoop(): void {
        this.isRefreshLoopStopped = true
    }

    //IMPLEMENTAR LA BASE DE DATOS
    async refresh() {
        const httpResponse = await fetch(this.#dataUrl)
        const tableData: { [key: string]: unknown }[] = await httpResponse.json()
        this.#tableManager.refreshTable(tableData)
    }

    async refreshLoop(loopTime: number) {
        this.isRefreshLoopStopped = false
        await refreshLoop(this, loopTime)
    }
}
