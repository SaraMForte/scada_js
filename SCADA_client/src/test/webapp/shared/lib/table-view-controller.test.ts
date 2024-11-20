/// @vitest-environment jsdom
import TableViewController from '@webapp/shared/lib/table-view-controller'
import { beforeEach, describe, expect, test } from 'vitest'
import sinon from 'sinon'

const tableId = 'testTable'
const rowsHeaders = { producto: 'Producto', unidades: 'Unidades', estado: 'Estado' }
const rowsContent = [
    { producto: 'Producto A', unidades: 100, estado: 'En Proceso' },
    { producto: 'Producto B', unidades: 250, estado: 'Finalizado' },
    { producto: 'Producto C', nonExistProperty: 50, estado: 'Pendiente' }
]

describe('Constructor', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    test('GIVEN table ID, headers, and URL WHEN initializing controller THEN it is created correctly', () => {
        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableViewController = new TableViewController({
            tableId: tableId,
            rowsHeaders: rowsHeaders,
            dataUrl: 'test-URL'
        })
        expect(tableViewController).toBeDefined()
    })

    test('GIVEN invalid ID, headers WHEN initializing controller THEN throws error', () => {
        let tableViewController
        try {
            tableViewController = new TableViewController({
                tableId: '',
                rowsHeaders: rowsHeaders,
                dataUrl: 'test-URL'
            })
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }

        document.body.innerHTML = `<table id="${tableId}"></table>`
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            tableViewController = new TableViewController({
                tableId: tableId,
                rowsHeaders: {},
                dataUrl: 'test-URL'
            })
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})

describe('Refresh', () => {
    beforeEach(() => {
        document.body.innerHTML = ''
    })

    test('GIVEN valid url WHEN get data for table THEN refresh table correctly',async () => {
        const keysRowsHeaders = Object.values(rowsHeaders)
        const keysRowsContent = rowsContent.map((value) => Object.values(value)).flat(1)
        keysRowsContent[7] = 'N/A'

        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableViewController = new TableViewController({
            tableId: tableId,
            rowsHeaders: rowsHeaders,
            dataUrl: 'test-url'
        })

        const fetchStub = sinon.stub(global, 'fetch')
        fetchStub.resolves({
            ok: true,
            json: async () => rowsContent
        } as Response)
        
        await tableViewController.refresh()
        expect(fetchStub.calledOnceWithExactly('test-url')).toBe(true)

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

describe('Refreshloop', () => {
    test('',async () => {
        document.body.innerHTML = `<table id="${tableId}"></table>`
        const tableViewController = new TableViewController({
            tableId: tableId,
            rowsHeaders: rowsHeaders,
            dataUrl: 'test-url'
        })
        const refreshLoopSpy = sinon.spy(tableViewController, 'refreshLoop')

        await tableViewController.refreshLoop(1000)

        expect(refreshLoopSpy.calledOnce).toBe(true)
        expect(refreshLoopSpy.calledWith(1000)).toBe(true)
        expect(tableViewController.isRefreshLoopStopped).toBe(false)

        tableViewController.stopRefreshLoop()
        expect(tableViewController.isRefreshLoopStopped).toBe(true)

        refreshLoopSpy.restore()
    })
})
