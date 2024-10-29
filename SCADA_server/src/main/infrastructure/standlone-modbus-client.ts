import { ModbusTCPClient, ModbusTCPRequest } from "jsmodbus"
import { ReadHoldingRegistersRequestBody } from "jsmodbus/dist/request"
import { IUserRequestResolve } from "jsmodbus/dist/user-request"
import { Socket, SocketConnectOpts } from "node:net"

export type StandloneModbusClientConstructor = {
    host : string,
    port : number, 
    socket : Socket,
    client : ModbusTCPClient
}


export class StandloneModbusClient {
    #socket: Socket
    #client: ModbusTCPClient
    #options : {host : string, port : number}

    constructor({host, port, socket, client} : StandloneModbusClientConstructor) {
        this.#options = {'host' : host, 'port' : port}
        this.#socket = socket
        this.#client = client
    }

    readHoldingRegisters(propertyIndex: number, numOfRecords : number): Promise<IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>> {
        return this.#client.readHoldingRegisters(propertyIndex, numOfRecords)
    }

    writeSingleRegister(propertyIndex : number, value : number) {
        return this.#client.writeSingleRegister(propertyIndex, value)
    }

    once(eventName: "connect", callback: () => void): StandloneModbusClient
    once(eventName: "error", callback: (error: Error) => void): StandloneModbusClient
    once(eventName: string, callback: (...args: any[]) => void): StandloneModbusClient {
        this.#socket.once(eventName, callback)
        return this
    }

    connect(callback?: (...args: []) => void): StandloneModbusClient {
        this.#socket.connect(this.#options, callback)
        return this
    }

    removeListener(eventName: "error", callback: (error: Error) => void): StandloneModbusClient
    removeListener(eventName: "connect", callback: () => void): StandloneModbusClient
    removeListener(eventName: string, callback: (...args: any[]) => void): StandloneModbusClient{
        this.#socket.removeListener(eventName, callback)
        return this
    }

    end(callback?: () => void): StandloneModbusClient {
        this.#socket.end(callback)
        return this
    }
}