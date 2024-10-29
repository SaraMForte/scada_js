import { ModbusTCPClient } from 'jsmodbus'
import { Socket } from 'node:net'

import PlcDataRepository from "../application/plc-data-repository";
import { PropertyError, PropertyNotFoundError } from '../application/errors';
import { StandloneModbusClient } from './standlone-modbus-client';
import { StandloneModbusClientPool } from './modbus-client-pool';


const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]))

export type ModbusPlcDataRepositoryConstructor = {
    host : string,
    port : number, 
    socket : Socket,
    client : ModbusTCPClient
}

/**
 * Conexion y Lectura mediante Modbus TCP con el PLC
 * slaveID = ID del esclavo
 * host = IP donde esta alojado el esclavo
 * port = puerto de comunicacion del esclavo
 */
export default class ModbusPlcDataRepository implements PlcDataRepository {
    #modbusClientPool : StandloneModbusClientPool

    constructor(standloneModbusClientPool : StandloneModbusClientPool) {
        this.#modbusClientPool = standloneModbusClientPool
    }

    /**
     * Lee un registro mediante comunicación Modbus TCP
     * @param property dirección del valor de lectura
     * @returns devuelve la promesa de un número
     */
    readValue(property: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                const propertyNumber = INDEX_BY_COLUM[property]
                if(typeof propertyNumber === 'undefined'){
                    reject(new PropertyNotFoundError(property))
                }
                standloneModbusClient.readHoldingRegisters(propertyNumber, 1)
                .then(response => {
                    const value = response.response.body.values

                    standloneModbusClient.removeListener('error', errorListener)
                    resolve(Number(value))
                })
                .catch(error => {
                    reject(error)
                })
                .finally(() => {
                    standloneModbusClient.end()
                })
            }
            const errorListener = (err : Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                standloneModbusClient.end()
                reject(err)
            }
            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)
            // Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }

    /**
     * Lee los registros mediante comunicación Modbus TCP 
     * @returns devuelve la promesa de un Map con la Clave: Nombre de la Variable PLC y Valor: de la variable
     */
    readValues() : Promise<Map<string, number>> {
        return new Promise(async (resolve, reject) => { 
            const standloneModbusClient = await this.#modbusClientPool.get()           
            const connectListener = () => {
                standloneModbusClient.readHoldingRegisters(0, 10)  //Inicio es Inclusive, Final es exclusive
                .then(response => {
                    const registers = response.response.body.valuesAsArray
                    const registersmap = new Map()
                    for (let i = 0; i < registers.length; i++) {
                        registersmap.set(REGISTERSNAMES[i],registers[i])
                    }
                    
                    standloneModbusClient.removeListener('error', errorListener)
                    resolve(registersmap)
                })
                .catch(error => {
                    reject(error)
                })
                .finally(() => {
                    standloneModbusClient.end()
                })
            }

            const errorListener = (err : Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)

            // Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }

    /**
     * Escribe en el registro indicado el valor asignado mediante comunicación Modbus TCP
     * @param property número del nombre en el registro de Modbus TCP
     * @param value valor que se asigna al registro Modbus TCP
     * @returns void
     */
    writeValue(property: string, value: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                standloneModbusClient.writeSingleRegister(Number(property), value)
                .then((response) => {
                    standloneModbusClient.removeListener('error', errorListener)
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                })
                .finally(() => {
                    standloneModbusClient.end()
                })
            }

            const errorListener = (err : Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)

            //Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }

    /**
     * Escribe los registros apartir del índice indicados los valor asignados mediante comunicación Modbus TCP
     * @param valuesMap 
     * @returns 
     */
    writeValues(valuesMap: Map<string, number>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                Promise.all([...valuesMap.entries()].map(([key, value]) => { 
                    return standloneModbusClient.writeSingleRegister(INDEX_BY_COLUM[key], value)}
                ))
                .then(() => {
                    standloneModbusClient.removeListener('error', errorListener)
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                })
                .finally(() => {
                    standloneModbusClient.end()
                })
            }
            
            const errorListener = (err : Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                reject(err)
            }
            
            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)
            //Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }
}