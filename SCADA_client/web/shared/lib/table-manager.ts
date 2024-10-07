export default class TableManager {
    #tableDoc
    #rowsHeaders

    constructor(tableId : string, rowsHeaders : {[headerName : string] : string}) {
        const tableDoc = document.getElementById(tableId)
        if(!tableDoc) {
            throw new Error(`The table with ID: ${tableId} not found`)
        }

        const headerObj = Object.entries(rowsHeaders)
        if(!headerObj.length) {
            throw new Error('Rows headers not found')
        }

        this.#tableDoc = tableDoc
        this.#rowsHeaders = headerObj
    }

    get tableId() {
        return this.#tableDoc
    }

    createTable() {
        const tableThead = this.#getTableThead()
        const tableBody = this.#getTableBody([])

        this.#tableDoc.innerHTML = tableThead + tableBody
    }

    #getTableThead() {
        let tableThead = `<thead><tr>`
        tableThead += this.#rowsHeaders
            .map((header) => `<th>${header[1]}</th>`)
            .join('')
        tableThead += `</tr></thead>`

        return tableThead
    }

    #getTableBody(dataBody : {[key: string] : unknown}[]) {
        if(!dataBody.length) {
            const rowHeaderLenght = this.#rowsHeaders.length
            return `<tbody><tr><td colspan="${rowHeaderLenght}">Data not found</td></tr></tbody>`
        }

        let tableBody = `<tbody>`
        for (const data of dataBody) {
            tableBody += `<tr>`
            tableBody += this.#rowsHeaders
                .map(rowContain => `<td>${data[rowContain[0] ?? 'N/A']}</td>`)
                .join('')
            tableBody += `</tr>`
        }
        tableBody += `</tbody>`

        return tableBody
    }

    refreshTable(dataBody : {[key: string] : unknown}[]) {
        const tableTbody = document.querySelector(`#${this.#tableDoc.id} tbody`)
        if(!tableTbody) {
            throw new Error(`The table with ID: ${this.#tableDoc} not found`)
        }

        tableTbody.innerHTML = this.#getTableBody(dataBody)
    }
}

