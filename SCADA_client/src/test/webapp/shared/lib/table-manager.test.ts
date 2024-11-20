/// @vitest-environment jsdom
import TableManager from '@webapp/shared/lib/table-manager'
import { describe, test, expect, afterEach } from 'vitest'

const tableId = 'testTable'
const rowsHeaders = { producto: 'Producto', unidades: 'Unidades', estado: 'Estado' }
const rowsContent = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', nonExistProperty: 50, estado: 'Pendiente' }
]

describe('Contructor', () => {
    afterEach(() => document.body.innerHTML = '')

    test('GIVEN rows headers and non-existing table id WHEN build table manager THEN throws error', () => {
        try {
            new TableManager('non-existing-id', rowsHeaders)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })

    test('GIVEN table id and empty rows headers WHEN build table manager THEN throws error', () => {
        try {
            document.body.innerHTML = `<table id="${tableId}"></table>`
            new TableManager(tableId, {})
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})

describe('Get id of table', () => {
    afterEach(() => document.body.innerHTML = '')

    test('GIVEN table manager created WHEN get table id THEN return table id', () => {
        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableManager = new TableManager(tableId, rowsHeaders)

        expect(tableManager.tableId).toEqual(tableId)
    })
})

describe('Create and Refresh', () => {
    afterEach(() => document.body.innerHTML = '')

    test('GIVEN table in dom WHEN create table with table manager THEN dom contains table with headers without body', () => {
        const keysRowsHeaders = Object.values(rowsHeaders)
        document.body.innerHTML = `<table id="${tableId}"></table>`

        const tableManager = new TableManager(tableId, rowsHeaders)
        expect(tableManager).not.toBeNull()

        tableManager.createTable()
        const tableDocument = document.getElementById(tableId)

        const thead = tableDocument!.querySelector('thead')
        expect(thead).toBeDefined()

        const headerRow = thead!.querySelectorAll('th')
        expect(headerRow).toBeDefined()

        headerRow!.forEach((value, key) => {
            expect(value.textContent).toEqual(keysRowsHeaders[key])
        })

        const tbody = tableDocument!.querySelector('tbody')
        expect(tbody).toBeDefined()

        const rowContent = tbody!.querySelector('td')
        expect(rowContent!.textContent).toEqual('Data not found')
    })

    test('GIVEN table created WHEN refresh data of the table THEN refreshed correctly', () => {
        const keysRowsHeaders = Object.values(rowsHeaders)
        const keysRowsContent = rowsContent.map((value) => Object.values(value)).flat(1)
        keysRowsContent[7] = 'N/A'

        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableManager = new TableManager(tableId, rowsHeaders)

        tableManager.createTable()
        tableManager.refreshTable(rowsContent)

        const tableDocument = document.getElementById(tableId)
        const thead = tableDocument!.querySelector('thead')
        expect(thead).toBeDefined()

        const headerRow = thead!.querySelectorAll('th')
        expect(headerRow).toBeDefined()

        headerRow!.forEach((value, key) => expect(value.textContent).toEqual(keysRowsHeaders[key]))

        const tbody = tableDocument!.querySelector('tbody')
        expect(tbody).toBeDefined()

        const contentRow = tbody!.querySelectorAll('td')
        contentRow.forEach((value, key) => expect(value.textContent).toEqual(String(keysRowsContent[key])))
    })
})
