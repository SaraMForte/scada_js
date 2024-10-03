import { SvgItemsKeys  } from "../../index/scada-svg-item-keys.js"

export type Colors = {    
    ON : [string, string, string, string]   //-fill -light -medium -dark
    OFF : [string, string, string, string]  //-fill -light -medium -dark
    WARN : [string, string, string, string] //-fill -light -medium -dark
}
const CHILD_SVG_NAMES = ['-fill', '-light', '-medium', '-dark']

/**
 * Clase que controla las propiedades de los items internos del SVG
 */
export default class SvgItemManager {
    #svgDoc : Document
    #colors : Colors

    /**
     * @param idSvg El ID correspondiente al SVG a controlar en el html
     * @param colors Los colores que se aplican según el estado del item interno del SVG
     */
    constructor(idSvg : string, colors : Colors) {
        const svgObject = document.getElementById(idSvg) as HTMLObjectElement
        const svgDoc = svgObject?.contentDocument
        if(!svgDoc) {
            throw new Error(`SVG with ID: ${idSvg} not found`)
        }

        this.#svgDoc = svgDoc
        this.#colors = colors
    }

    /**
     * Actualiza el estado de los items internos del SVG
     * @param data Los datos que contiene el estado de los items
     * @param scadaSvgItemsKeys Las claves o IDs de los items internos del SVG y las claves para la busqueda de su estado
     */
    refreshItemsStatus(data : {[clave: string]: number}, scadaSvgItemsKeys : SvgItemsKeys) {
        const refreshItemsStatusContext = new RefreshItemsStatusContext(data, scadaSvgItemsKeys, this.#svgDoc, this.#colors)
        
        for (const itemId in scadaSvgItemsKeys) {
            const svgItem = this.#svgDoc.getElementById(itemId) as SVGGraphicsElement | null
            if (!svgItem) {
                throw new Error(`Element with ID: ${itemId} not found`)
            }

            refreshItemsStatusContext.changeItemColor(itemId)
            refreshItemsStatusContext.updateSymbolForceVisibility(svgItem)
        }
    }
}

/**
 * Clase que contiene los métodos del contexto de refreshItemStatus
 */
class RefreshItemsStatusContext {
    #data
    #scadaSvgItemsKeys 
    #colors
    #svgDoc

    /**
     * 
     * @param data Los datos que contiene el estado de los items
     * @param scadaSvgItemsKeys Las claves o IDs de los items internos del SVG y las claves para la busqueda de su estado
     * @param svgDoc Documento del DOM que contiene el SVG
     * @param colors Los colores que se aplican según el estado del item interno del SVG
     */
    constructor(data : {[clave: string]: number}, scadaSvgItemsKeys : SvgItemsKeys, svgDoc : Document, colors : Colors) {
        this.#data = data
        this.#scadaSvgItemsKeys = scadaSvgItemsKeys
        this.#svgDoc = svgDoc
        this.#colors = colors
    }

    /**
     * Cambia el color o colores del item
     * @param itemId Id de del item que cambiará de color
     */
    changeItemColor(itemId : string) {
        const valueItem = this.#data[this.#scadaSvgItemsKeys[itemId].valueKey]
        const valueWarn = this.#data[this.#scadaSvgItemsKeys[itemId].warnValueKey]

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
    
    /**
     * Actualiza la visibilidad del simbolo de forzado asociado a un item o lo añade
     * @param svgItem elemento grafico del SVG al que se añade el simbolo de forzado
     */
    updateSymbolForceVisibility(svgItem : SVGGraphicsElement) {
        const tagUse = this.#svgDoc.getElementById(svgItem.id + '-force')

        if(tagUse) {
            const forceDataValue = this.#data[this.#scadaSvgItemsKeys[svgItem.id].forceValueKey]
            tagUse.style.visibility = forceDataValue ? 'visible' : 'hidden'

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