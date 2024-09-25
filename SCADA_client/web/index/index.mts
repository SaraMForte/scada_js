import { changeColor, changeTextContent, Colors } from "../shared/lib/refresh.mjs"
import { setClickable } from "../shared/lib/set-clickable.mjs"
import SvgItemColorChanger from "../shared/lib/svgItemColorChange.mjs"

import { SVG_ELEMENT_OBJ } from "./svg-element-obj.mjs"




window.addEventListener("load", () => {
    initializeControlPanel()
})

//------------------------------------------------ Funtions -----------------------------------------------------
function initializeControlPanel() {
    console.info('Initializing Control Panel')
    setClickableInit()
    refreshLoop()
}
/**
 * Establece los elementos clickables y su función
 */
function setClickableInit() {
}

function createManualWindow(varName : string) {
    window.open(`http://localhost:3020/manualcontrolpanel/manual-control-panel.html?varName=${varName}`,
        `Control Manual de ${varName}`,
        'width=350,height=360,menubar=no')
}

/**
 * Función que establece el bucle de la función refresView
 */
function refreshLoop() {
    refreshView().then(() => setTimeout(refreshLoop, 1000))
}

//Los Arrays se deberian cambiar a un objeto typa como ^^!!!!!!!!!
const COLORS : Colors = {
    ON : ['#001000', '#003000', '#00ff00', '#00AA00'],  
    OFF : ['#100000', '#300000', '#ff0000', '#AA0000'],  
    WARN : ['#FF9900', '#FF6600', '#FFD700', '#FFA500']  
}

const svgItemColorChanger = new SvgItemColorChanger('ControlPanelSVG', COLORS)

/**
 * Se conectará con el servidor para actualizar los elementos de la pantalla
 */
async function refreshView (): Promise<void> {
    const response = await fetch('http://localhost:3000/modbus-read-values')
    const data = await response.json()

    svgItemColorChanger.changeItemColor(data, SVG_ELEMENT_OBJ)
}



