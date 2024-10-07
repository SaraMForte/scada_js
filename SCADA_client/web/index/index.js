import SvgDataViewController from "../shared/lib/svg-data-view-controller.js";
import TableViewController from "../shared/lib/table-view-controller.js";
import { SCADA_SVG_ITEMS_KEYS } from "./scada-svg-item-keys.js";
//Los Arrays se deberian cambiar a un objeto typa como ^^!!!!!!!!!
const COLORS = {
    ON: ['#001000', '#003000', '#00ff00', '#00AA00'],
    OFF: ['#100000', '#300000', '#ff0000', '#AA0000'],
    WARN: ['#FF9900', '#FF6600', '#FFD700', '#FFA500']
};
//------------------------------------------------ Funtions -----------------------------------------------------
/**
 * Establece los elementos clickables y su función
 */
function setClickableInit() {
}
function createManualWindow(varName) {
    window.open(`http://localhost:3020/manualcontrolpanel/manual-control-panel.html?varName=${varName}`, `Control Manual de ${varName}`, 'width=350,height=360,menubar=no');
}
//------------------------------------------------ Init Index -----------------------------------------------------
window.addEventListener("load", () => {
    console.info('Initializing Control Panel');
    const svgDataViewController = new SvgDataViewController({
        idSvg: 'ControlPanelSVG',
        colors: COLORS,
        dataUrl: 'http://localhost:3000/modbus-read-values',
        svgItemsKeys: SCADA_SVG_ITEMS_KEYS
    });
    const tableViewController = new TableViewController({
        tableId: 'tabla-produccion',
        rowsHeaders: { producto: 'Producto', unidades: 'Unidades', estado: 'Estado' },
        dataUrl: 'PON UNA URL'
    });
    svgDataViewController.refreshLoop(1000);
    tableViewController.refreshLoop(1000);
    console.info('Control Panel Initialized');
});
