const datosProduccion = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', unidades: 50, estado: 'Pendiente' }
];

export default class TableManager {
    #tableId

    constructor(tableId : string) {
        this.#tableId = tableId
    }

    get tableId() {
        return this.#tableId
    }

    createTable(rowsHeaders : string[]) {
        const table = document.getElementById(this.#tableId)
        if(!table) {
            throw new Error(`The table with ID: ${this.#tableId} not found`)
        }

        const tableThead = this.#getTableThead(rowsHeaders)
        const tableBody = this.#getTableBody([])

        table.innerHTML = tableThead + tableBody
    }

    #getTableThead(rowsHeaders : string[]) {
        if(!rowsHeaders.length) {
            throw new Error('Rows headers not found')
        }

        let tableThead : string = `<thead><tr>`
        for (const rowHeader of rowsHeaders) {
            tableThead += `<th>${rowHeader}</th>`
        }
        tableThead += `</tr></thead>`
        return tableThead
    }

    #getTableBody(dataBody : Array<{}>) {
        if(!dataBody.length) {
            return `<tbody><tr></tr></tbody>`
        }

        let tableBody = `<tbody><tr>`
        for (const data of dataBody) {
            for(const [key, value] of Object.entries(data)) {
                tableBody += `<td>${value}</td>`
            }
        }
        tableBody += `</tr></tbody>`
        return tableBody
    }
}

