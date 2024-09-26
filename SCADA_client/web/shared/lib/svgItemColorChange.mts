
import { SvgElementObj  } from "../../index/svg-element-obj.mjs"

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
            for (const element in svgElementObj) {
                const valueItem = data[svgElementObj[element].valueKey]
                const valueWarn = data[svgElementObj[element].warnValueKey]
                const valueForce = data[svgElementObj[element].forceValueKey]
                
                const choosedColor = this.chooseColor(valueItem, valueWarn)

                for (let i = 0; i < CHILD_SVG_NAMES.length; i++) {
                    this.changesSubElementColor(svgDoc, element + CHILD_SVG_NAMES[i], choosedColor[i])
                }
                this.updateSvgVisibilityInTopRight(svgDoc, element, valueForce)

            }
        }
    }

    chooseColor(valueItem : number, valueWarn : number) {
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

    changesSubElementColor(svgDoc : Document, subelementId: string, choosedColor: string) {
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
    
    updateSvgVisibilityInTopRight(svgDoc : Document, subelementId : string, valueForce : number) {
        const tagUse = svgDoc?.getElementById(subelementId + '-force')
        console.log(tagUse)
        if(tagUse) {
            tagUse.style.visibility = valueForce === 1 ? 'visible' : 'hidden'

        } else {
            const svgItem = svgDoc.getElementById(subelementId)
            //const boundingBox = svgItem?.getBoundingClientRect()

            const tagUse = document.createElementNS("http://www.w3.org/2000/svg", "use")
            tagUse.setAttribute("id", subelementId + "-force")
            tagUse.setAttribute("href", "/shared/force-symbol.svg#red-circle-with-f")
            tagUse.setAttribute("x", `0`)
            tagUse.setAttribute("y", `0`)
            tagUse.setAttribute("width", "50")
            tagUse.setAttribute("height", "50")
            tagUse.setAttribute("visibility", "visible")
            console.log(tagUse)

            svgItem?.appendChild(tagUse)
            console.log(svgItem)
        }
    }    
}

