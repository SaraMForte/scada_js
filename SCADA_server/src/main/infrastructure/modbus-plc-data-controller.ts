/**
 * Se establece el endpoint para la lectura de datos de Modbus TCP
 * Devuelve un JSON
 */
import PlcDataService from "../application/plc-data-service";
import ModbusPlcDataRepository from "./modbus-plc-data-repository";

import  Express  from "express";

const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]))

const modbusPlcDataRouter = Express.Router()

const service = new PlcDataService(new ModbusPlcDataRepository({
    slaveID: 1,
    host: '192.168.0.210',
    port: 502
}))

modbusPlcDataRouter.get('/modbus-read-values', (req, res) => {
    service.readValues()
        .then( data => res.json(Object.fromEntries(data)))
})

modbusPlcDataRouter.get('/modbus-read-value', (req, res) => {
    service.readValue('C')
        .then( data => res.json({'C' : data}))
})

modbusPlcDataRouter.put('/modbus-write-value', (req, res) => {
    const data : {key : string, value : number} = req.body
    const keyIndexStr : string = String(INDEX_BY_COLUM[data.key])

    service.writeValue(keyIndexStr, data.value)

    res.sendStatus(204)
})

modbusPlcDataRouter.put('/modbus-write-values', (req, res) => {
    try {
        const data : {key : string, value : number} = req.body
        const dataMap = dataToMap(data)
    
        service.writeValues(dataMap)
    
        res.sendStatus(204)
    } catch(error) {
        console.error(error)
        res.sendStatus(400)
    }
})

function dataToMap(data : {key : string, value : number}) : Map<string, number> {
    return Object.entries(data).reduce((acumulator , [key, value]) => {
        if (!REGISTERSNAMES.includes(key)) {
            throw new Error(`\nLa clave ${key} no existe en el PLC\n`)
        }
        if (typeof value !== 'number') {
            throw new Error(`\nEl valor ${value} de la clave ${key} no es de tipo number\n`)
        }
        acumulator.set(key, value)

        return acumulator
    }, new Map<string, number>())
}


export default modbusPlcDataRouter