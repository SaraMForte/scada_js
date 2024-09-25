import  Express  from "express";
import cors from 'cors'

import modbusPlcDataRouter from "../main/infrastructure/modbus-plc-data-controller";

const server = Express()

server.use(cors())
server.use(Express.json())
server.use('/', modbusPlcDataRouter)

server.listen(3000)