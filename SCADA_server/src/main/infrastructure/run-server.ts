import  Express  from "express"
import cors from 'cors'

import PlcDataService from "../application/plc-data-service"
import generateModbusPlcDataRouter from "./modbus-plc-data-controller"

export default function runServer(service : PlcDataService) {
    const server = Express()
    
    server.use(cors())
    server.use(Express.json())
    
    server.use('/', generateModbusPlcDataRouter(service))
    
    return server.listen(3000)
}