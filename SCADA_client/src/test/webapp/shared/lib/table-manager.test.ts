/// @vitest-environment jsdom
import TableManager from '@webapp/shared/lib/table-manager'
import { describe, test, expect, afterEach } from 'vitest'

describe('TableManager', () => {
    const tableId = 'testTable'
    const rowsHeaders = { producto: 'Producto', unidades: 'Unidades', estado: 'Estado' }

    afterEach(() => {
        afterEach(() => (document.body.innerHTML = ''))
    })

    //Constructor
    test('GIVEN rows headers and non-existing table id WHEN build table manager THEN throws error', () => {
        try {
            new TableManager('non-existing-id', rowsHeaders)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })

    test('GIVEN table id and empty rows headers WHEN build table manager THEN throws error', () => {
        try {
            new TableManager(tableId, {})
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })

    //get
    test('GIVEN table manager created WHEN get table id THEN return table id', () => {
        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableManager = new TableManager(tableId, rowsHeaders)

        expect(tableManager.tableId).toEqual(tableId)
    })

    test('GIVEN table in dom WHEN create table with table manager THEN dom contains table with headers without body', () => {
        const keysRowsHeaders = Object.keys(rowsHeaders)
        document.body.innerHTML = `<table id="${tableId}"></table>`

        const tableManager = new TableManager(tableId, rowsHeaders)
        expect(tableManager).not.toBeNull()

        tableManager.createTable()
        const tableDocument = document.getElementById(tableId)

        const thead = tableDocument?.querySelector('thead')
        expect(thead).toBeDefined()

        const headerRow = thead?.querySelectorAll('th')
        expect(headerRow).toBeDefined()

        headerRow?.forEach((value, key) => expect(value.textContent).toEqual(keysRowsHeaders[key].toLowerCase()))
    })

    test('GIVEN table created WHEN refresh data of the table THEN refreshed correctly', () => {
        document.body.innerHTML =
            `<table id="testTable"><thead><tr><th>Producto</th><th>Unidades</th><th>Estado</th></tr></thead>` +
            `<tbody><tr><td colspan="3">Data not found</td></tr></tbody></table>`

        const expedtedTableContent: string =
            `<table id="testTable"><tbody>` +
            `<tr><td>Producto A</td><td>100</td><td>En Proceso</td></tr>` +
            `<tr><td>Producto B</td><td>250</td><td>Finalizado</td></tr>` +
            `<tr><td>Producto C</td><td>N/A</td><td>Pendiente</td></tr>` +
            `</tbody></table>`

        const tableManager = new TableManager(tableId, rowsHeaders)
        tableManager.refreshTable([
            { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
            { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
            { producto: 'Producto C', nonExistProperty: 50, estado: 'Pendiente' }
        ])

        expect(document.getElementById(tableId)?.outerHTML).toEqual(expedtedTableContent)
    })
})
