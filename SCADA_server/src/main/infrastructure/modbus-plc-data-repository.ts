import { ModbusTCPClient } from 'jsmodbus'
import { Socket } from 'node:net'

import PlcDataRepository from "../application/plc-data-repository";


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
    private readonly socket : Socket
    private readonly client : ModbusTCPClient
    private readonly options : {host: string , port : number}

    constructor({host, port, socket, client} : ModbusPlcDataRepositoryConstructor) {
        this.socket = socket
        this.client = client
        this.options = {'host' : host, 'port' : port}
    }

    /**
     * Lee un registro mediante comunicación Modbus TCP
     * @param property dirección del valor de lectura
     * @returns devuelve la promesa de un número
     */
    readValue(property: string): Promise<number> {
        return new Promise((resolve, reject) => {

            const connectListener = () => {
                const propertyNumber = INDEX_BY_COLUM[property]
                this.client.readHoldingRegisters(propertyNumber, 1)
                .then(response => {
                    const value = response.response.body.values

                    this.socket.removeListener('error', errorListener)
                    resolve(Number(value))
                })
                .catch(error => {
                    reject(error)
                })
                .finally(() => {
                    this.socket.end()
                })
            }
            const errorListener = (err : Error) => {
                this.socket.removeListener('connect', connectListener)
                reject(err)
            }
            

            // Leer registros cuando la conexión esté establecida
            this.socket.once('connect', connectListener)
            this.socket.once('error', errorListener)

            // Conectar al esclavo
            this.socket.connect(this.options)
        })
    }

    /**
     * Lee los registros mediante comunicación Modbus TCP 
     * @returns devuelve la promesa de un Map con la Clave: Nombre de la Variable PLC y Valor: de la variable
     */
    readValues() : Promise<Map<string, number>> {
        return new Promise((resolve, reject) => {            
            const connectListener = () => {
                this.client.readHoldingRegisters(0, 10)  //Inicio es Inclusive, Final es exclusive
                .then(response => {
                    const registers = response.response.body.valuesAsArray
                    const registersmap = new Map()
                    for (let i = 0; i < registers.length; i++) {
                        registersmap.set(REGISTERSNAMES[i],registers[i])
                    }
                    
                    this.socket.removeListener('error', errorListener)
                    resolve(registersmap)
                })
                .catch(error => {
                    reject(error)
                })
                .finally(() => {
                    this.socket.end()
                })
            }

            const errorListener = (err : Error) => {
                this.socket.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            this.socket.once('connect', connectListener)
            this.socket.once('error', errorListener)

            // Conectar al esclavo
            this.socket.connect(this.options)
        })
    }

    /**
     * Escribe en el registro indicado el valor asignado mediante comunicación Modbus TCP
     * @param property número del nombre en el registro de Modbus TCP
     * @param value valor que se asigna al registro Modbus TCP
     * @returns void
     */
    writeValue(property: string, value: number): Promise<void> {
        return new Promise((resolve, reject) => {
            const connectListener = () => {
                this.client.writeSingleRegister(Number(property), value)
                .then((response) => {
                    this.socket.removeListener('error', errorListener)
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                })
                .finally(() => {
                    this.socket.end()
                })
            }

            const errorListener = (err : Error) => {
                this.socket.removeListener('connect', connectListener)
                reject(err)
            }

            // Leer registros cuando la conexión esté establecida
            this.socket.once('connect', connectListener)
            this.socket.once('error', errorListener)

            //Conectar al esclavo
            this.socket.connect(this.options)
        })
    }

    /**
     * Escribe los registros apartir del índice indicados los valor asignados mediante comunicación Modbus TCP
     * @param valuesMap 
     * @returns 
     */
    writeValues(valuesMap: Map<string, number>): Promise<void> {
        return new Promise((resolve, reject) => {
            const connectListener = () => {
                Promise.all([...valuesMap.entries()].map(([key, value]) => this.client.writeSingleRegister(INDEX_BY_COLUM[key], value)
                ))
                .then(() => {
                    this.socket.removeListener('error', errorListener)
                    resolve()
                })
                .catch((error) => {
                    reject(error)
                })
                .finally(() => {
                    this.socket.end()
                })
            }
            
            const errorListener = (err : Error) => {
                this.socket.removeListener('connect', connectListener)
                reject(err)
            }
            
            // Leer registros cuando la conexión esté establecida
            this.socket.once('connect', connectListener)
            this.socket.once('error', errorListener)

            //Conectar al esclavo
            this.socket.connect(this.options)
        })
    }
}