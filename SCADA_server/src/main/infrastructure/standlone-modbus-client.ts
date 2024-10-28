import { ModbusTCPClient, ModbusTCPRequest } from "jsmodbus"
import { ReadHoldingRegistersRequestBody } from "jsmodbus/dist/request"
import { IUserRequestResolve } from "jsmodbus/dist/user-request"
import { Socket, SocketConnectOpts } from "node:net"

export class StandloneModbusClient {
    #socket: Socket
    #client: ModbusTCPClient

    constructor(socket: Socket, client: ModbusTCPClient) {
        this.#socket = socket
        this.#client = client
    }

    readHoldingRegisters(propertyNumber: number): Promise<IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>> {
        return this.#client.readHoldingRegisters(propertyNumber, 1)
    }

    once(eventName: "error", callback: (error: Error) => void): StandloneModbusClient
    once(eventName: "connect", callback: () => void): StandloneModbusClient
    once(eventName: string, callback: (...args: any[]) => void): StandloneModbusClient {
        this.#socket.once(eventName, callback)
        return this
    }

    connect(options: SocketConnectOpts, callback?: (...args: []) => void): StandloneModbusClient {
        this.#socket.connect(options, callback)
        return this
    }

    end(callback?: () => void): StandloneModbusClient {
        this.#socket.end(callback)
        return this
    }
}