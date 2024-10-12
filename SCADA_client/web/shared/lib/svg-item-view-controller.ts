import { SvgItemsKeys } from "../../index/scada-svg-item-keys.js"
import { Refreshable, refreshLoop } from "./refreshable.js"
import SvgItemManager, { Colors } from "./svg-item-manager.js"

type SvgItemViewControllerOptions = {
    idSvg : string,
    colors : Colors,
    dataUrl : string,
    svgItemsKeys : SvgItemsKeys
}

export default class SvgItemViewController implements Refreshable{
    #svgItemManager
    #dataUrl
    #svgItemsKeys

    constructor ({idSvg, colors, dataUrl, svgItemsKeys} : SvgItemViewControllerOptions) {
        this.#svgItemManager = new SvgItemManager(idSvg, colors)
        this.#dataUrl = dataUrl
        this.#svgItemsKeys = svgItemsKeys
    }

    /**
     * Se conectará con el servidor para actualizar los elementos de la pantalla
     */
    async refresh (): Promise<void> {
        const response = await fetch(this.#dataUrl)
        const data = await response.json()
        
        this.#svgItemManager.refreshItemsStatus(data, this.#svgItemsKeys)
    }

    /**
     * Función que establece el bucle de la función refresh
     */
    async refreshLoop(loopTime : number) {
        await refreshLoop(this , loopTime)
    }

    initializeOnce() {
        this.#svgItemManager.setItemsClickables(this.#svgItemsKeys, () => {})
    }

}