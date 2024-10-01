var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import SvgItemManager from "../shared/lib/svgItemManager.js";
import { SCADA_SVG_ITEMS_KEYS } from "./scada-svg-item-keys.js";
window.addEventListener("load", () => {
    initializeControlPanel();
});
//------------------------------------------------ Funtions -----------------------------------------------------
function initializeControlPanel() {
    console.info('Initializing Control Panel');
    setClickableInit();
    refreshLoop();
}
/**
 * Establece los elementos clickables y su función
 */
function setClickableInit() {
}
function createManualWindow(varName) {
    window.open(`http://localhost:3020/manualcontrolpanel/manual-control-panel.html?varName=${varName}`, `Control Manual de ${varName}`, 'width=350,height=360,menubar=no');
}
/**
 * Función que establece el bucle de la función refresView
 */
function refreshLoop() {
    refreshView()
        .then(() => setTimeout(refreshLoop, 1000))
        .catch(error => {
        console.error(error);
        setTimeout(refreshLoop, 5000);
    });
}
//Los Arrays se deberian cambiar a un objeto typa como ^^!!!!!!!!!
const COLORS = {
    ON: ['#001000', '#003000', '#00ff00', '#00AA00'],
    OFF: ['#100000', '#300000', '#ff0000', '#AA0000'],
    WARN: ['#FF9900', '#FF6600', '#FFD700', '#FFA500']
};
//Crea la instancia para modificar los elementos del SVG
const svgItemManager = new SvgItemManager('ControlPanelSVG', COLORS);
/**
 * Se conectará con el servidor para actualizar los elementos de la pantalla
 */
function refreshView() {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch('http://localhost:3000/modbus-read-values');
        const data = yield response.json();
        svgItemManager.refreshItemsStatus(data, SCADA_SVG_ITEMS_KEYS);
    });
}
