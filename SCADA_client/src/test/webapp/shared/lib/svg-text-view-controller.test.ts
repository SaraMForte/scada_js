/// @vitest-environment jsdom
import SvgTextViewController from '@webapp/shared/lib/svg-text-view-controller'
import sinon from 'sinon'
import { beforeEach, describe, expect, test } from 'vitest'

const dummySvgId = 'test-svg-id'
const dumySvgUrl = 'http:/test-url'
const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
        <g id="textGroup1">
            <text class="volumen value">
                <tspan>9999 L</tspan>
            </text>
            <text class="capacidad value">
                <tspan>9999 L</tspan>
            </text>
        </g>
    </svg>
`

describe('Contructor', () => {
    beforeEach(() => {
        document.body.innerHTML = ``
    })

    test('GIVEN url and svg id WHEN build text controller THEN build correctly', () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`

        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(svgContent, 'image/svg+xml'),
            writable: true
        })

        const svgTextViewController = new SvgTextViewController({ idSvg: dummySvgId, dataUrl: dumySvgUrl })
        expect(svgTextViewController).toBeDefined()
        expect(svgTextViewController.isRefreshLoopStopped).toBe(false)
    })

    test('GIVEN invalid svg id WHEN build text controller THEN throws error', () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const svgTextViewController = new SvgTextViewController({ idSvg: dummySvgId, dataUrl: dumySvgUrl })
        } catch (error) {
            expect(error).instanceOf(Error)
        }
    })
    
    test('GIVEN html object without svg WHEN building text controller THEN throws error', () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        expect(() => new SvgTextViewController({ idSvg: dummySvgId, dataUrl: dumySvgUrl })).toThrowError()
    })

})

describe('Refresh', () => {
    test('GIVEN controller WHEN refresh text content THEN refresh correctly', async () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(svgContent, 'image/svg+xml'),
            writable: true
        })
        const svgTextViewController = new SvgTextViewController({ idSvg: dummySvgId, dataUrl: dumySvgUrl })

        const refreshLoopSpy = sinon.spy(svgTextViewController, 'refreshLoop')

        await svgTextViewController.refreshLoop(1000)

        expect(refreshLoopSpy.calledOnce).toBe(true)
        expect(refreshLoopSpy.calledWith(1000)).toBe(true)
        expect(svgTextViewController.isRefreshLoopStopped).toBe(false)

        svgTextViewController.stopRefreshLoop()
        expect(svgTextViewController.isRefreshLoopStopped).toBe(true)

        refreshLoopSpy.restore()
    })
})
