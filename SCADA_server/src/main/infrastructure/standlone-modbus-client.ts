import { ReadHoldingRegistersRequestBody } from "jsmodbus/dist/request"
import { IUserRequestResolve } from "jsmodbus/dist/user-request"
import { ModbusTCPClient, ModbusTCPRequest } from "jsmodbus"
import { Socket } from "node:net"

export type StandloneModbusClientConstructor = {
    host : string,
    port : number, 
    socket : Socket,
    client : ModbusTCPClient
}


export class StandloneModbusClient {
    private readonly socket: Socket
    private readonly client: ModbusTCPClient
    private readonly options : {host : string, port : number}

    constructor({host, port, socket, client} : StandloneModbusClientConstructor) {
        this.options = {'host' : host, 'port' : port}
        this.socket = socket
        this.client = client
    }

    readHoldingRegisters(propertyIndex: number, numOfRecords : number): Promise<IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>> {
        return this.client.readHoldingRegisters(propertyIndex, numOfRecords)
    }

    writeSingleRegister(propertyIndex : number, value : number) {
        return this.client.writeSingleRegister(propertyIndex, value)
    }

    once(eventName: "connect", callback: () => void): StandloneModbusClient
    once(eventName: "error", callback: (error: Error) => void): StandloneModbusClient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    once(eventName: string, callback: (...args: any[]) => void): StandloneModbusClient {
        this.socket.once(eventName, callback)
        return this
    }

    connect(callback?: (...args: []) => void): StandloneModbusClient {
        this.socket.connect(this.options, callback)
        return this
    }

    removeListener(eventName: "error", callback: (error: Error) => void): StandloneModbusClient
    removeListener(eventName: "connect", callback: () => void): StandloneModbusClient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    removeListener(eventName: string, callback: (...args: any[]) => void): StandloneModbusClient{
        this.socket.removeListener(eventName, callback)
        return this
    }

    end(callback?: () => void): StandloneModbusClient {
        this.socket.end(callback)
        return this
    }
}