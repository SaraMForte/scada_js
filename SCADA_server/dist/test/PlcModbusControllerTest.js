"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const modbus_plc_data_controller_1 = __importDefault(require("../main/infrastructure/modbus-plc-data-controller"));
const server = (0, express_1.default)();
server.use((0, cors_1.default)());
server.use(express_1.default.json());
server.use('/', modbus_plc_data_controller_1.default);
server.listen(3000);
//# sourceMappingURL=PlcModbusControllerTest.js.map