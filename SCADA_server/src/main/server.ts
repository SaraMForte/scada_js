import PlcDataService from "./application/plc-data-service";
import ModbusPlcDataRepository from "./infrastructure/modbus-plc-data-repository";
import { Socket } from "node:net";
import { ModbusTCPClient } from "jsmodbus";
import runServer from "./infrastructure/run-server";
import { StandloneModbusClientPool } from "./infrastructure/modbus-client-pool";
import { StandloneModbusClient } from "./infrastructure/standlone-modbus-client";


const service = new PlcDataService(new ModbusPlcDataRepository(new StandloneModbusClientPool(
    () => {
        const socket = new Socket()
        return new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket: socket,
            client: new ModbusTCPClient(socket, 1)
        })
    }, 10
)))

runServer(service)
