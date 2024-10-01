import { SvgElementObj  } from "../../index/svg-element-obj.js"

export type Colors = {    
    ON : [string, string, string, string]   //-fill -light -medium -dark
    OFF : [string, string, string, string]  //-fill -light -medium -dark
    WARN : [string, string, string, string] //-fill -light -medium -dark
}

const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark']

export default class SvgItemColorChanger {
    #idSvg : string
    #colors : Colors

    constructor(idSvg : string, colors : Colors) {
        this.#idSvg = idSvg
        this.#colors = colors
    }

    changeItemColor(data : any, svgElementObj : SvgElementObj) {
        const svgObject = document.getElementById(this.#idSvg) as HTMLObjectElement
        const svgDoc = svgObject?.contentDocument
        if(svgDoc) {
            for (const itemFrangmentId in svgElementObj) {
                const svgItemFrangment = svgDoc.getElementById(itemFrangmentId)
                if (svgItemFrangment) {
                    const valueItem = data[svgElementObj[itemFrangmentId].valueKey]
                    const valueWarn = data[svgElementObj[itemFrangmentId].warnValueKey]
                    const valueForce = data[svgElementObj[itemFrangmentId].forceValueKey]
                    
                    const choosedColor = this.#chooseColor(valueItem, valueWarn)
    
                    for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
                        this.#changesSubElementColor(svgDoc, itemFrangmentId + CHILD_SVG_NAMES[i], choosedColor[i])
                    }
                    this.#updateSymbolForceVisibility(svgDoc, itemFrangmentId, valueForce)
                }
                else {
                    throw new Error(`Element not found with ID: ${svgItemFrangment}`)
                }
            }
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

    #changesSubElementColor(svgDoc : Document, subelementId: string, choosedColor: string) {
        const svgItem = svgDoc?.getElementById(subelementId) 
        const svgGroupItems = svgItem?.tagName === 'g' 
                                ? svgItem.querySelectorAll<SVGAElement>('*') 
                                : [svgItem as SVGAElement | null]
        
        svgGroupItems.forEach((element) => {
            if (element) {
                element.style.fill = choosedColor
            }
        })
    }
    
    #updateSymbolForceVisibility(svgDoc : Document, svgElement : string, valueForce : number) {
        const tagUse = svgDoc.getElementById(svgElement + '-force')
        console.log(arguments)
        console.log(tagUse)

        if(tagUse) {
            tagUse.style.visibility = valueForce === 1 ? 'visible' : 'hidden'

        } else {
            const tagGroup = svgDoc?.getElementById(svgElement)
            const boundOfUse = tagGroup?.getBoundingClientRect()

            const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use")
            tagUse.setAttribute("href", "/shared/element-force.svg#force-symbol")
            tagUse.setAttribute("id", `${svgElement}-force`)
            tagUse.setAttribute("x", `-10`)  //-10 perfect right
            tagUse.setAttribute("y", `-10`)
            tagUse.setAttribute("width", "20")
            tagUse.setAttribute("height", "20")

            tagGroup?.appendChild(tagUse)
        }
    }    
}
