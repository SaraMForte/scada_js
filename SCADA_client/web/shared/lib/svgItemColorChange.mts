
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
    
    updateSvgVisibilityInTopRight(svgDoc : Document, svgElement : string, valueForce : number) {
        const svgSymbol = document.getElementById(svgElement + '-force')

        if(svgSymbol) {
            svgSymbol.style.visibility = valueForce === 1 ? 'visible' : 'hidden'

        } else {

            const objectElement = document.createElement('object')

            const gettedElement = svgDoc.getElementById(svgElement)

            const boundingBox = gettedElement?.getBoundingClientRect()
            
            objectElement.setAttribute('data', '/shared/svg-force-symbol.svg')
            objectElement.setAttribute('type', 'image/svg+xml')
            objectElement.setAttribute('id', svgElement + '-force')
            objectElement.setAttribute('style', `position:absolute; x:${boundingBox?.left} ; y:${boundingBox?.top} ; width:10px ; height:10px`)
            
            const container = document.getElementById('force-symbols')
            container?.appendChild(objectElement)
        }
    }    
}

