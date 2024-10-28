/**
 * Se establecen los endpoints para la lectura y escritura de datos por Modbus TCP
 * Devuelve un JSON
 */
import  Express, { Response, Request } from "express";

import PlcDataService, { PlcDatasResoult as PlcDataResult } from "../application/plc-data-service";
import { PropertyError } from "../application/errors";

const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]))

type RequestHandler = (req : Request, res : Response) => void

type ResponseError = {errorName : string, message : string, cause? : ResponseError}

export function mapErrorToResponseError(error : Error) : ResponseError {
    const responseError : ResponseError = {
        errorName : error.name,
        message : error.message
    } 
    if(error.cause) {
        responseError.cause  = mapErrorToResponseError(error.cause as Error)
    }
    return responseError
}

function modbusReadValueHandler(service : PlcDataService) : RequestHandler {
    return (req, res) => {
        const property = req.query.property
        if(typeof property === 'string') {
            service.readValue(property)
            .then( data => res.status(200).json({[property] : data}))
            .catch(error => res.status(400).json(mapErrorToResponseError(error)))
        } else {
            const propertyError = new PropertyError(`${property}`, `Property ${property} is a Invalid parameter`)
            res.status(400).json(mapErrorToResponseError(propertyError))
        }
    }
}

function modbusReadValuesHandler(service : PlcDataService) : RequestHandler {
    return (req, res) => {
        if(typeof req.query.properties === 'string') {
            const propertiesArray = req.query.properties.split(',')
            service.readValues(propertiesArray)
            .then(result => buildReadValuesResponse(result, res))
            .catch(error => res.status(400).json(mapErrorToResponseError(error)))
        } else {
            service.readValues()
            .then(result => buildReadValuesResponse(result, res))
            .catch(error => res.status(400).json(mapErrorToResponseError(error)))
        }
    }
} 

function buildReadValuesResponse(result : PlcDataResult, res : Response ): Response {
    if (result.error.length < 1) {
        return res.status(200).json(mapPlcDatasResultTo200ResponseBody(result))
    }
    if (result.data.size < 1) {
        return res.status(400).json(mapPlcDatasResultTo400ResponseBody(result))
    }
    return res.status(207).json(mapPlcDatasResultTo207ResponseBody(result))
}

function mapPlcDatasResultTo200ResponseBody(result : PlcDataResult) {
    return Object.fromEntries(result.data)
}

function mapPlcDatasResultTo400ResponseBody(result : PlcDataResult) {
    return result.error.map((error) => mapErrorToResponseError(error))
}

function mapPlcDatasResultTo207ResponseBody(result : PlcDataResult) {
    const responseErrors = result.error.map((error) => mapErrorToResponseError(error))
    const resultData = Object.fromEntries(result.data)
    return {
        result : {
            200 : resultData,
            500 : responseErrors
        }
    }
}

function modbusWriteValueHandler(service : PlcDataService) : RequestHandler {
    return (req, res) => {
        const data : {key : string, value : number} = req.body
        if (!requireValidBody(data)) {
            return res.status(500).send(mapErrorToResponseError(new Error('Invalid request body')))
        }
        const keyIndexStr = INDEX_BY_COLUM[data.key]
        if (keyIndexStr === undefined) {
            return res.status(500).send(mapErrorToResponseError(new Error(`Property ${data.key} not found in Plc`)))
        }
        service.writeValue(String(data.key), data.value)
        .then(() => {
            res.sendStatus(204)
        })
        .catch(error => {
            res.status(500).send(mapErrorToResponseError(error))
        })
    }
}

function requireValidBody(requestBody : unknown) {
    return typeof (requestBody as {key : string, value : number}).key === 'string' 
    && typeof (requestBody as {key : string, value : number}).value === 'number' 
    && typeof requestBody === 'object'
}

function modbusWriteValuesHandler(service : PlcDataService) : RequestHandler {
    return async (req, res) => {
        const data : {key : string, value : number} = req.body
        await dataToMap(data)
            .then(async dataMap => await service.writeValues(dataMap)
                .then(errorArray => buildWriteValuesResponse(errorArray, res))
                .catch(error => res.status(400).send(mapErrorToResponseError(error)))
            )
            .catch(error => res.status(400).send(mapErrorToResponseError(error)))
    }
}

async function dataToMap(data : {key : string, value : number}) : Promise<Map<string, number>> {
    return Object.entries(data).reduce((acumulator , [key, value]) => {
        if (!REGISTERSNAMES.includes(key)) {
            throw new Error(`The key ${key} does not exist in the PLC`)
        }
        if (typeof value !== 'number') {
            throw new Error(`The value ${value} for key ${key} isnt of type number`)
        }
        acumulator.set(key, value)
        return acumulator
    }, new Map<string, number>())
}

function buildWriteValuesResponse(errorArray : PropertyError[], res : Response) {
    if(errorArray.length < 1) {
        return res.sendStatus(204)
    } 
    return res.status(207).send(errorArray.map(error => mapErrorToResponseError(error)))
}

export default function generateModbusPlcDataRouter(service : PlcDataService) {
    const modbusPlcDataRouter = Express.Router()

    modbusPlcDataRouter.get('/modbus-read-value', modbusReadValueHandler(service))
    modbusPlcDataRouter.get('/modbus-read-values', modbusReadValuesHandler(service))
    modbusPlcDataRouter.put('/modbus-write-value', modbusWriteValueHandler(service))
    modbusPlcDataRouter.put('/modbus-write-values', modbusWriteValuesHandler(service))
    return modbusPlcDataRouter
}