import { ModbusTCPClient } from 'jsmodbus'
import { PropertyNotFoundError, PropertyWriteError } from '../application/errors'
import { Socket } from 'node:net'
import { StandloneModbusClientPool } from './modbus-client-pool'
import PlcDataRepository from '../application/plc-data-repository'

const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]))

export type ModbusPlcDataRepositoryConstructor = {
    host: string
    port: number
    socket: Socket
    client: ModbusTCPClient
}

/**
 * Conexion y Lectura mediante Modbus TCP con el PLC
 * slaveID = ID del esclavo
 * host = IP donde esta alojado el esclavo
 * port = puerto de comunicacion del esclavo
 */
export default class ModbusPlcDataRepository implements PlcDataRepository {
    #modbusClientPool: StandloneModbusClientPool

    constructor(standloneModbusClientPool: StandloneModbusClientPool) {
        this.#modbusClientPool = standloneModbusClientPool
    }

    readValue(property: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                const propertyNumber = INDEX_BY_COLUM[property]
                if (typeof propertyNumber === 'undefined') {
                    reject(new PropertyNotFoundError(property))
                }
                standloneModbusClient
                    .readHoldingRegisters(propertyNumber, 1)
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
            const errorListener = (err: Error) => {
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

    readValues(): Promise<Map<string, number>> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                standloneModbusClient
                    .readHoldingRegisters(0, 10) //Inicio es Inclusive, Final es exclusive
                    .then(response => {
                        const registers = response.response.body.valuesAsArray
                        const registersmap = new Map()

                        for (let i = 0; i < registers.length; i++) {
                            registersmap.set(REGISTERSNAMES[i], registers[i])
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

            const errorListener = (err: Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)

            // Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }

    writeValue(property: string, value: number): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                const propertyNumber = INDEX_BY_COLUM[property]
                if (typeof propertyNumber === 'undefined') {
                    reject(new PropertyWriteError(property, value))
                    return
                }
                standloneModbusClient
                    .writeSingleRegister(propertyNumber, value)
                    .then(() => {
                        standloneModbusClient.removeListener('error', errorListener)
                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
                    .finally(() => {
                        standloneModbusClient.end()
                    })
            }

            const errorListener = (err: Error) => {
                standloneModbusClient.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            standloneModbusClient.once('error', errorListener)

            //Conectar al esclavo
            standloneModbusClient.connect(connectListener)
        })
    }

    writeValues(valuesMap: Map<string, number>): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const standloneModbusClient = await this.#modbusClientPool.get()
            const connectListener = () => {
                valuesMap.forEach((value, property) => {
                    const propertyNumber = INDEX_BY_COLUM[property]
                    if (typeof propertyNumber === 'undefined') {
                        reject(new PropertyWriteError(property, value))
                    }
                })
                Promise.all(
                    [...valuesMap.entries()].map(([key, value]) => {
                        return standloneModbusClient.writeSingleRegister(INDEX_BY_COLUM[key], value)
                    })
                )
                    .then(() => {
                        standloneModbusClient.removeListener('error', errorListener)
                        resolve()
                    })
                    .catch(error => {
                        reject(error)
                    })
                    .finally(() => {
                        standloneModbusClient.end()
                    })
            }

            const errorListener = (err: Error) => {
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
