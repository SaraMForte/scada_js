import PlcDataService from "./application/plc-data-service";
import ModbusPlcDataRepository from "./infrastructure/modbus-plc-data-repository";
import { Socket } from "node:net";
import { ModbusTCPClient } from "jsmodbus";
import runServer from "./infrastructure/run-server";

const socket = new Socket()
const service = new PlcDataService(new ModbusPlcDataRepository({
    host: 'localhost',
    port: 502,
    socket: socket,
    client: new ModbusTCPClient(socket, 1)
}))

runServer(service)
