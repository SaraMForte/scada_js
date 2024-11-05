import cors from 'cors'
import Express from 'express'
import generateModbusPlcDataRouter from './modbus-plc-data-controller'
import PlcDataService from '../application/plc-data-service'

export default function runServer(service: PlcDataService) {
    const server = Express()

    server.use(cors())
    server.use(Express.json())

    server.use('/', generateModbusPlcDataRouter(service))

    return server.listen(3000)
}
