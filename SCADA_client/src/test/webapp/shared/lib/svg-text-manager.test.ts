/// @vitest-environment jsdom
import SvgTextManager from '@webapp/shared/lib/svg-text-manager'
import { beforeEach, describe, expect, test } from 'vitest'

const svgId = 'test-svg-id'
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
const dataTextGroups = [
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['volumen', '100 L']]) },
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['capacidad', '2000 Kg']]) }
]

describe('Contructor', () => {
    test('GIVEN svg document WHEN build text manager THEN build correctly', async () => {
        document.body.innerHTML = `<object id="${svgId}" data="./testSvg"></object>`
        const svgElement = document.getElementById(svgId) as HTMLObjectElement

        Object.defineProperty(svgElement, 'contentDocument', {
            value: new DOMParser().parseFromString(svgContent, 'image/svg+xml'),
            writable: true
        })

        const svgDoc = svgElement.contentDocument
        expect(svgDoc).not.toBeNull()

        const svgTextManager = new SvgTextManager(svgDoc!)
        expect(svgTextManager).toBeDefined()
    })
})

describe('Refresh text content', () => {
    let svgDoc : Document | null
    let svgTextManager : SvgTextManager

    beforeEach(() => {
        document.body.innerHTML = `<object id="${svgId}" data="./testSvg"></object>`
        const svgElement = document.getElementById(svgId) as HTMLObjectElement

        Object.defineProperty(svgElement, 'contentDocument', {
            value: new DOMParser().parseFromString(svgContent, 'image/svg+xml'),
            writable: true
        })

        svgDoc = svgElement.contentDocument
        svgTextManager = new SvgTextManager(svgDoc!)
    })

    test('GIVEN valid text group data WHEN refreshing texts THEN updates SVG text elements correctly', () => {
        svgTextManager.refreshTextContent(dataTextGroups)

        dataTextGroups.forEach(group => {
            group.svgTextsOfTextGroup.forEach((textContent, elementKey) => {
                const elementValue = svgDoc?.querySelector(`#${group.groupId} > text.${elementKey}.value`)?.textContent
                expect(elementValue).toEqual(textContent)
            })
        })
    })

    test('GIVEN invalid text group data WHEN refreshing texts THEN throws error', () => {
        try {
            svgTextManager.refreshTextContent([
                { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['velocidad', '10 m/s']]) }
            ])
        } catch (error) {
            expect(error).toBeInstanceOf(Error)
        }
    })
})
