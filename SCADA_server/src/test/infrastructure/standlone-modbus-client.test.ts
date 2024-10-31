import { Socket } from "node:net";
import { StandloneModbusClient } from "../../main/infrastructure/standlone-modbus-client";
import { test, describe, expect, beforeEach } from "vitest";
import sinon, { SinonStub } from "sinon";
import { ModbusTCPClient, ModbusTCPRequest } from "jsmodbus";
import { ReadHoldingRegistersRequestBody, WriteSingleRegisterRequestBody } from "jsmodbus/dist/request";
import { IUserRequestResolve } from "jsmodbus/dist/user-request";

describe('Modbus Standlone methods',() => {
    let socketMock : sinon.SinonStubbedInstance<Socket>
    let clientMock : sinon.SinonStubbedInstance<ModbusTCPClient>

    beforeEach(() => {
        socketMock = sinon.createStubInstance(Socket)
        clientMock = sinon.createStubInstance(ModbusTCPClient)
    })
    
    test('GIVEN standlone modbus client WHEN read holding register THEN return response', async () => {
        const mockResponse = { A: 11 } 
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        clientMock.readHoldingRegisters.resolves(
            mockResponse as unknown as IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>
        )

        expect(await standloneModbusClient.readHoldingRegisters(0,1)).toEqual(mockResponse)
        expect(clientMock.readHoldingRegisters.calledOnce).toBeTruthy()
        expect(clientMock.readHoldingRegisters.calledWith(0,1)).toBeTruthy()
    })

    test('GIVEN standlone modbus client WHEN write single register THEN return response', async () => {
        const mockResponse = 'Write Succesfull'
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        clientMock.writeSingleRegister.resolves(
            mockResponse as unknown as IUserRequestResolve<ModbusTCPRequest<WriteSingleRegisterRequestBody>>
        )

        expect(await standloneModbusClient.writeSingleRegister(1, 11)).toEqual(mockResponse)
        expect(clientMock.writeSingleRegister.called).toBeTruthy()
        expect(clientMock.writeSingleRegister.calledWith(1,11)).toBeTruthy()
    })

    test('GIVEN standlone modbus client WHEN executes once funtion THEN executes correctly', () => {
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        const mockFuntion = (err : Error) => {}

        expect(standloneModbusClient.once('error', mockFuntion)).toEqual(standloneModbusClient)
        expect(socketMock.once.calledOnce).toBeTruthy()
        expect(
            (socketMock.once as unknown as SinonStub<[eventName: 'error', (err : Error) => void], Socket>)
                .calledWith('error', mockFuntion)
        ).toBeTruthy()
    })

    test('GIVEN standlone modbus client WHEN connect is called THEN connect correctly', () => {
        const mockFuntion = () => {}
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        expect(standloneModbusClient.connect(mockFuntion)).toEqual(standloneModbusClient)
        expect(socketMock.connect.calledOnce).toBeTruthy()
        expect(
            (socketMock.connect as unknown as SinonStub<
                [options :{host:string, port: number}, callback :() => void], Socket
                >).calledWith({host : 'localhost', port : 502}, mockFuntion)
        ).toBeTruthy()
    })

    test('GIVEN standlone modbus client WHEN remove listener THEN remove correctly', () => {
        const mockFuntion = (err : Error) => {}
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        expect(standloneModbusClient.removeListener('error', mockFuntion)).toEqual(standloneModbusClient)
        expect(socketMock.removeListener.calledOnce).toBeTruthy()
        expect(
            (socketMock.removeListener as unknown as SinonStub<[eventName: 'error', (err : Error) => void], Socket>)
                .calledWith('error', mockFuntion)
        ).toBeTruthy()
    })
    
    test('GIVEN standlone modbus client WHEN end conexion THEN end correctly.', () => {
        const mockFuntion = () => {}
        const standloneModbusClient = new StandloneModbusClient({
            host: 'localhost',
            port: 502,
            socket : socketMock,
            client : clientMock
        })

        expect(standloneModbusClient.end(mockFuntion)).toEqual(standloneModbusClient)
        expect(socketMock.end.calledOnce).toBeTruthy()
        expect((socketMock.end as unknown as SinonStub<[()=>void], Socket>).calledWith(mockFuntion)).toBeTruthy()
    })
})