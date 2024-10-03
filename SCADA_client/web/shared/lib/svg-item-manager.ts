import { SvgItemsKeys  } from "../../index/scada-svg-item-keys.js"

export type Colors = {    
    ON : [string, string, string, string]   //-fill -light -medium -dark
    OFF : [string, string, string, string]  //-fill -light -medium -dark
    WARN : [string, string, string, string] //-fill -light -medium -dark
}

type RefreshItemsStatusContext = {
    data : {[clave: string]: number},
    scadaSvgItemsKeys : SvgItemsKeys
}

const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark']

export default class SvgItemManager {
    #svgDoc : Document
    #colors : Colors

    constructor(idSvg : string, colors : Colors) {
        const svgObject = document.getElementById(idSvg) as HTMLObjectElement
        const svgDoc = svgObject?.contentDocument
        if(!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`)
        }

        this.#svgDoc = svgDoc
        this.#colors = colors
    }

    refreshItemsStatus(data : {[clave: string]: number}, scadaSvgItemsKeys : SvgItemsKeys) {
        const refreshItemsStatusContext = {data, scadaSvgItemsKeys}
        
        for (const itemId in scadaSvgItemsKeys) {
            const svgItem = this.#svgDoc.getElementById(itemId) as SVGGraphicsElement | null
            if (!svgItem) {
                throw new Error(`Element with ID: ${itemId} not found`)
            }

            this.#changeItemColor(refreshItemsStatusContext, itemId)
            this.#updateSymbolForceVisibility(refreshItemsStatusContext, svgItem)
        }
    }

    #changeItemColor({data, scadaSvgItemsKeys} : RefreshItemsStatusContext, itemId : string) {
        const valueItem = data[scadaSvgItemsKeys[itemId].valueKey]
        const valueWarn = data[scadaSvgItemsKeys[itemId].warnValueKey]

        const choosedColor = this.#chooseColor(valueItem, valueWarn)

        for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
            this.#changesItemFragmentColor(itemId + CHILD_SVG_NAMES[i], choosedColor[i])
        }
    }

    #chooseColor(valueItem : number, valueWarn : number) {
        if(valueWarn === 1) {
            return this.#colors.WARN
        }
        if(valueItem === 1) {
            return this.#colors.ON
        }
        if(valueItem === 0) {
            return this.#colors.OFF
        }
        throw new Error(`Unknown value of valueItem: ${valueWarn} and valueWarn: ${valueItem}`)
    }

    #changesItemFragmentColor(itemFrangmentId: string, choosedColor: string) {
        const svgItem = this.#svgDoc?.getElementById(itemFrangmentId) 
        const svgGroupItems = svgItem?.tagName === 'g' 
                                ? svgItem.querySelectorAll<SVGElement>('*') 
                                : [svgItem as SVGElement | null]
        
        svgGroupItems.forEach((element) => {
            if (element) {
                element.style.fill = choosedColor
            }
        })
    }
    
    #updateSymbolForceVisibility({data, scadaSvgItemsKeys} : RefreshItemsStatusContext, svgItem : SVGGraphicsElement) {
        const tagUse = this.#svgDoc.getElementById(svgItem.id + '-force')

        if(tagUse) {
            tagUse.style.visibility = data[scadaSvgItemsKeys[svgItem.id].forceValueKey] ? 'visible' : 'hidden'

        } else {
            const boundOfUse = svgItem?.getBBox()

            const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use")
            tagUse.setAttribute("href", "/shared/element-force.svg#force-symbol")
            tagUse.setAttribute("id", `${svgItem.id}-force`)
            tagUse.setAttribute("x", `${boundOfUse?.width-10}`)  //-10 perfect right
            tagUse.setAttribute("y", `-10`)
            tagUse.setAttribute("width", "20")
            tagUse.setAttribute("height", "20")

            svgItem?.appendChild(tagUse)
        }
    }    
}
