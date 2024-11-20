import { Colors } from '@webapp/shared/lib/svg-item-manager'
import SvgItemViewController from '@webapp/shared/lib/svg-item-view-controller'
import sinon from 'sinon'
import { beforeEach, describe, expect, test } from 'vitest'

const dummySvgId = 'test-svg-id'
const dummySvgContent = `
<svg xmlns="http://www.w3.org/2000/svg" id="testItem" width="100" height="100">
    <g id="testItem1" transform="translate(50, 50)">
        <g id="testItem1-group1">
            <path id="testItem1-dark"  />
            <path id="testItem1-medium"/>
            <path id="testItem1-light" />
            <g id="testItem1-fill">
                <path/>
                <path/>
            </g>
        </g>
    </g>
</svg>`
const COLORS: Colors = {
    ON: ['#ff0000', '#ff0001', '#ff0002', '#ff0003'],
    OFF: ['#00ff00', '#00ff01', '#00ff02', '#00ff03'],
    WARN: ['#0000ff', '#0100ff', '#0200ff', '#0300ff']
}
const scadaSvgItemsKeys = {
    testItem1: {
        valueKey: 'A',
        warnValueKey: 'B',
        forceValueKey: 'C'
    }
}

describe('Contructor', () => {
    beforeEach(() => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })
    })

    test('GIVEN valid options WHEN build svg item view controller THEN build correctly', () => {
        const svgItemViewController = new SvgItemViewController({
            idSvg: dummySvgId,
            colors: COLORS,
            dataUrl: 'htttp:/dummy-test-url',
            svgItemsKeys: scadaSvgItemsKeys
        })
        expect(svgItemViewController).toBeDefined()
    })

    test('GIVEN invalid svgId WHEN build svg item view controller THEN throws error', () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const svgItemViewController = new SvgItemViewController({
                idSvg: 'ErrorSvgId',
                colors: COLORS,
                dataUrl: 'htttp:/dummy-test-url',
                svgItemsKeys: scadaSvgItemsKeys
            })
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})

describe('Refresh', () => {
    test('GIVEN controller WHEN refresh item status THEN refresh correctly', async () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })

        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        if (testItem) {
            testItem.getBBox = () => new DOMRect(0, 0, 100, 50)
        }

        const svgItemViewController = new SvgItemViewController({
            idSvg: dummySvgId,
            colors: COLORS,
            dataUrl: 'htttp:/dummy-test-url',
            svgItemsKeys: scadaSvgItemsKeys
        })

        const mockFetch = sinon.stub(global, 'fetch')
        const fetchResponse = {
            json: sinon.stub().resolves({ A: 1, B: 1, C: 1 })
        } as unknown as Response
        mockFetch.resolves(fetchResponse)

        const refreshLoopSpy = sinon.spy(svgItemViewController, 'refreshLoop')
        const refreshSpy = sinon.spy(svgItemViewController, 'refresh')

        await svgItemViewController.refreshLoop(1000)

        expect(refreshLoopSpy.calledOnce).toBe(true)
        expect(refreshLoopSpy.calledWith(1000)).toBe(true)
        expect(refreshSpy.calledOnce).toBe(true)
        expect(svgItemViewController.isRefreshLoopStopped).toBe(false)

        svgItemViewController.stopRefreshLoop()
        expect(svgItemViewController.isRefreshLoopStopped).toBe(true)

        refreshLoopSpy.restore()
    })
})

describe('Initialize Once', () => {
    test('GIVEN controller WHEN initializing the controller process THEN it initializes the process correctly', () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })

        const svgItemViewController = new SvgItemViewController({
            idSvg: dummySvgId,
            colors: COLORS,
            dataUrl: 'htttp:/dummy-test-url',
            svgItemsKeys: scadaSvgItemsKeys
        })

        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        if (testItem) {
            testItem.getBBox = () => new DOMRect(0, 0, 100, 50)
        }

        svgItemViewController.initializeOnce()
    })
})
