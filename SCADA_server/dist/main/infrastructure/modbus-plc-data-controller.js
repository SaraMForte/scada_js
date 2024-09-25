"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Se establece el endpoint para la lectura de datos de Modbus TCP
 * Devuelve un JSON
 */
const plc_data_service_1 = __importDefault(require("../application/plc-data-service"));
const modbus_plc_data_repository_1 = __importDefault(require("./modbus-plc-data-repository"));
const express_1 = __importDefault(require("express"));
const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]));
const modbusPlcDataRouter = express_1.default.Router();
const service = new plc_data_service_1.default(new modbus_plc_data_repository_1.default({
    slaveID: 1,
    host: 'localhost',
    port: 502
}));
modbusPlcDataRouter.get('/modbus-read-values', (req, res) => {
    service.readValues()
        .then(data => res.json(Object.fromEntries(data)));
});
modbusPlcDataRouter.get('/modbus-read-value', (req, res) => {
    service.readValue('C')
        .then(data => res.json({ 'C': data }));
});
modbusPlcDataRouter.put('/modbus-write-value', (req, res) => {
    const data = req.body;
    const keyIndexStr = String(INDEX_BY_COLUM[data.key]);
    service.writeValue(keyIndexStr, data.value);
    res.sendStatus(204);
});
modbusPlcDataRouter.put('/modbus-write-values', (req, res) => {
    try {
        const data = req.body;
        const dataMap = dataToMap(data);
        service.writeValues(dataMap);
        res.sendStatus(204);
    }
    catch (error) {
        console.error(error);
        res.sendStatus(400);
    }
});
function dataToMap(data) {
    return Object.entries(data).reduce((acumulator, [key, value]) => {
        if (!REGISTERSNAMES.includes(key)) {
            throw new Error(`\nLa clave ${key} no existe en el PLC\n`);
        }
        if (typeof value !== 'number') {
            throw new Error(`\nEl valor ${value} de la clave ${key} no es de tipo number\n`);
        }
        acumulator.set(key, value);
        return acumulator;
    }, new Map());
}
exports.default = modbusPlcDataRouter;
//# sourceMappingURL=modbus-plc-data-controller.js.map