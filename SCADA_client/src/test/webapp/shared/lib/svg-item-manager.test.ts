/// @vitest-environment jsdom
import SvgItemManager, { Colors } from '@webapp/shared/lib/svg-item-manager'
import Sinon from 'sinon'
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
</svg>

`
const COLORS: Colors = {
    ON: ['#ff0000', '#ff0001', '#ff0002', '#ff0003'],
    OFF: ['#00ff00', '#00ff01', '#00ff02', '#00ff03'],
    WARN: ['#0000ff', '#0100ff', '#0200ff', '#0300ff']
}

describe('Contructor for SvgItemManager', () => {
    beforeEach(() => {
        document.body.innerHTML = ``
    })

    test('GIVEN colors and valid object svg id WHEN build item manager THEN build correctly', () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })
        const svgItemManager = new SvgItemManager(dummySvgId, COLORS)
        expect(svgItemManager).toBeDefined()
    })

    test('GIVEN invalid svg id WHEN build text controller THEN throws error', () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const svgTextViewController = new SvgItemManager(dummySvgId, COLORS)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })

    test('GIVEN html object without svg WHEN building text controller THEN throws error', () => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        expect(() => new SvgItemManager(dummySvgId, COLORS)).toThrowError()
    })
})

describe('Refresh items status', () => {
    let svgItemManager: SvgItemManager
    const scadaSvgItemsKeys = {
        testItem1: {
            valueKey: 'A',
            warnValueKey: 'B',
            forceValueKey: 'C'
        }
    }

    beforeEach(() => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })
        svgItemManager = new SvgItemManager(dummySvgId, COLORS)
    })

    test('GIVEN svg with item WHEN refresh item status THEN refresh color and force symbol correctly', () => {
        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        if (testItem) {
            testItem.getBBox = () => new DOMRect(0, 0, 100, 50)

            for (let i = 0; i < 8; i++) {
                const bitDataA = i & 1
                const bitDataB = (i >> 1) & 1
                const bitDataC = (i >> 2) & 1
                svgItemManager.refreshItemsStatus({ A: bitDataA, B: bitDataB, C: bitDataC }, scadaSvgItemsKeys)

                const choosedcolor: string[] = choosecolor(bitDataA, bitDataB)
                expect(testItem.querySelectorAll('path')[0].style.fill).toEqual(choosedcolor[3])
                expect(testItem.querySelectorAll('path')[1].style.fill).toEqual(choosedcolor[2])
                expect(testItem.querySelectorAll('path')[2].style.fill).toEqual(choosedcolor[1])

                testItem
                    .querySelector('g')
                    ?.querySelector('g')
                    ?.querySelectorAll('path')
                    .forEach(element => {
                        expect(element.style.fill).toEqual(choosedcolor[0])
                    })

                expect(testItem.querySelector('use')?.style.visibility).toEqual(bitDataC ? 'visible' : 'hidden')
                expect(testItem.querySelector('use')?.id).toEqual('testItem1-force')
            }
        }
    })

    function choosecolor(bitDataA: number, bitDataB: number): string[] {
        if (bitDataB === 1) {
            return COLORS.WARN
        }
        if (bitDataA === 1) {
            return COLORS.ON
        }
        return COLORS.OFF
    }

    test('GIVEN invalid svg item id WHEN attempt refresh item status THEN throws error', () => {
        try {
            svgItemManager.refreshItemsStatus(
                { A: 1 },
                {
                    testError: {
                        valueKey: 'D',
                        warnValueKey: 'E',
                        forceValueKey: 'F'
                    }
                }
            )
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })

    test('GIVEN invalid status values WHEN attempt refresh item status THEN throws error', () => {
        try {
            svgItemManager.refreshItemsStatus({ A: 2, B: 2, C: 2 }, scadaSvgItemsKeys)
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})

describe('Set items clickables', () => {
    let svgItemManager: SvgItemManager
    const scadaSvgItemsKeys = {
        testItem1: {
            valueKey: 'A',
            warnValueKey: 'B',
            forceValueKey: 'C'
        }
    }

    beforeEach(() => {
        document.body.innerHTML = `<object id="${dummySvgId}" data="./testSvg"></object>`
        Object.defineProperty(document.getElementById(dummySvgId), 'contentDocument', {
            value: new DOMParser().parseFromString(dummySvgContent, 'image/svg+xml'),
            writable: true
        })
        svgItemManager = new SvgItemManager(dummySvgId, COLORS)
    })

    test('GIVEN svg item WHEN set as clickable THEN click triggers the callback correctly', () => {
        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        expect(testItem).toBeDefined()
        testItem!.getBBox = () => new DOMRect(0, 0, 100, 50)

        expect(testItem?.querySelector('rect')).toBeNull()

        const mockCallbackSpy = Sinon.spy(() => 'Test Click Success')

        svgItemManager.setItemsClickables(scadaSvgItemsKeys, mockCallbackSpy)

        expect(testItem?.querySelector('rect')).toBeDefined()

        expect(mockCallbackSpy.calledOnce).toBe(false)
        testItem?.dispatchEvent(new MouseEvent('click'))
        expect(mockCallbackSpy.calledOnce).toBe(true)

        expect(mockCallbackSpy.returnValues[0]).toEqual('Test Click Success')
    })

    test('', () => {
        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        expect(testItem).toBeDefined()
        testItem!.getBBox = () => new DOMRect(0, 0, 100, 50)

        svgItemManager.setItemsClickables(scadaSvgItemsKeys, () => {})
        testItem?.dispatchEvent(new MouseEvent('mouseover'))
        expect(testObject.contentDocument?.getElementById('testItem1-select-indicator')?.style.visibility).toEqual(
            'visible'
        )

        testItem?.dispatchEvent(new MouseEvent('mouseout'))
        expect(testObject.contentDocument?.getElementById('testItem1-select-indicator')?.style.visibility).toEqual(
            'hidden'
        )
    })

    test('GIVEN invalid svg item WHEN set as clickable THEN throws error', () => {
        const scadaSvgItemsKeysError = {
            testError: {
                valueKey: 'D',
                warnValueKey: 'E',
                forceValueKey: 'F'
            }
        }

        const testObject = document.getElementById(dummySvgId) as HTMLObjectElement
        const testItem = testObject.contentDocument?.getElementById('testItem1') as SVGGraphicsElement | null
        testItem!.getBBox = () => new DOMRect(0, 0, 100, 50)

        svgItemManager = new SvgItemManager(dummySvgId, COLORS)

        try {
            svgItemManager.setItemsClickables(scadaSvgItemsKeysError, () => {})
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})
