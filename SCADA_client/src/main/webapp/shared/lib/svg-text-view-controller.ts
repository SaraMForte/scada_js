import { Refreshable, refreshLoop } from './refreshable.js'
import SvgTextManager from './svg-text-manager.js'

type SvgTextViewControllerOptions = {
    idSvg: string
    dataUrl: string
}

const data: { groupId: string; svgTextsOfTextGroup: Map<string, string> }[] = [
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['volumen', '100 L']]) },
    { groupId: 'textGroup1', svgTextsOfTextGroup: new Map([['capacidad', '2000 Kg']]) }
]

export default class SvgTextViewController implements Refreshable {
    isRefreshLoopStopped: boolean
    #svgTextManager
    #dataUrl

    constructor({ idSvg, dataUrl }: SvgTextViewControllerOptions) {
        const svgObject = document.getElementById(idSvg) as HTMLObjectElement | null

        if (!svgObject) {
            throw new Error(`SVG with ID: ${idSvg} not found`)
        }

        let svgDoc: Document | null = null
        try {
            svgDoc = svgObject.contentDocument
            if (!svgDoc) {
                throw new Error(`Failed to access contentDocument of SVG with ID: ${idSvg}`)
            }
        } catch (error) {
            throw new Error(`Error accessing SVG content`, {cause : error})
        }
        const svgTextManager = new SvgTextManager(svgDoc)

        this.#svgTextManager = svgTextManager
        this.#dataUrl = dataUrl
        this.isRefreshLoopStopped = false
    }

    stopRefreshLoop(): void {
        this.isRefreshLoopStopped = true
    }
    async refresh(): Promise<void> {
        // const response = await fetch(this.#dataUrl)
        // const data = await response.json()

        this.#svgTextManager.refreshTextContent(data)
    }

    async refreshLoop(loopTime: number): Promise<void> {
        await refreshLoop(this, loopTime)
    }
}
