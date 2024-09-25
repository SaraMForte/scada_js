"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsmodbus_1 = require("jsmodbus");
const node_net_1 = require("node:net");
const REGISTERSNAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const INDEX_BY_COLUM = Object.fromEntries(REGISTERSNAMES.map((key, index) => [key, index]));
/**
 * Conexion y Lectura mediante Modbus TCP con el PLC
 * slaveID = ID del esclavo
 * host = IP donde esta alojado el esclavo
 * port = puerto de comunicacion del esclavo
 */
class ModbusPlcDataRepository {
    constructor({ slaveID, host, port }) {
        this.socket = new node_net_1.Socket();
        this.client = new jsmodbus_1.ModbusTCPClient(this.socket, slaveID);
        this.options = { 'host': host, 'port': port };
    }
    /**
     * Lee un registro mediante comunicación Modbus TCP
     * @param property dirección del valor de lectura
     * @returns devuelve la promesa de un número
     */
    readValue(property) {
        return new Promise((resolve, reject) => {
            this.socket.once('connect', () => {
                const propertyNumber = INDEX_BY_COLUM[property];
                this.client.readHoldingRegisters(propertyNumber, 1)
                    .then(response => {
                    const value = response.response.body.values;
                    resolve(Number(value));
                })
                    .catch(error => {
                    reject(error);
                })
                    .finally(() => {
                    this.socket.end();
                });
            });
            this.socket.once('error', reject);
            // Conectar al esclavo
            this.socket.connect(this.options);
        });
    }
    /**
     * Lee los registros mediante comunicación Modbus TCP
     * @returns devuelve la promesa de un Map con la Clave: Nombre de la Variable PLC y Valor: de la variable
     */
    readValues() {
        return new Promise((resolve, reject) => {
            // Leer registros cuando la conexión esté establecida
            this.socket.once('connect', () => {
                this.client.readHoldingRegisters(0, 10) //Inicio es Inclusive, Final es exclusive
                    .then(response => {
                    const registers = response.response.body.valuesAsArray;
                    const registersmap = new Map();
                    console.log(registers);
                    for (let i = 0; i < registers.length; i++) {
                        registersmap.set(REGISTERSNAMES[i], registers[i]);
                    }
                    resolve(registersmap);
                })
                    .catch(error => {
                    reject(error);
                })
                    .finally(() => {
                    this.socket.end();
                });
            });
            this.socket.once('error', reject);
            // Conectar al esclavo
            this.socket.connect(this.options);
        });
    }
    /**
     * Escribe en el registro indicado el valor asignado mediante comunicación Modbus TCP
     * @param property número del nombre en el registro de Modbus TCP
     * @param value valor que se asigna al registro Modbus TCP
     * @returns void
     */
    writeValue(property, value) {
        return new Promise((resolve, reject) => {
            this.socket.once('connect', () => {
                this.client.writeSingleRegister(Number(property), value)
                    .then((response) => {
                    resolve();
                })
                    .catch((error) => {
                    reject(error);
                })
                    .finally(() => {
                    this.socket.end();
                });
            });
            this.socket.once('error', reject);
            //Conectar al esclavo
            this.socket.connect(this.options);
        });
    }
    /**
     * Escribe los registros apartir del índice indicados los valor asignados mediante comunicación Modbus TCP
     * @param valuesMap
     * @returns
     */
    writeValues(valuesMap) {
        return new Promise((resolve, reject) => {
            this.socket.once('connect', () => {
                Promise.all([...valuesMap.entries()].map(([key, value]) => this.client.writeSingleRegister(INDEX_BY_COLUM[key], value)))
                    .then(() => {
                    resolve();
                })
                    .catch((error) => {
                    reject(error);
                })
                    .finally(() => {
                    this.socket.end();
                });
            });
            this.socket.once('error', reject);
            //Conectar al esclavo
            this.socket.connect(this.options);
        });
    }
}
exports.default = ModbusPlcDataRepository;
//# sourceMappingURL=modbus-plc-data-repository.js.map