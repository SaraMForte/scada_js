import { Socket } from 'net'
import sinon from 'sinon'
import { ModbusTCPClient, ModbusTCPRequest } from 'jsmodbus'
import { beforeEach, describe, expect, test} from 'vitest'
import ModbusPlcDataRepository from '../../main/infrastructure/modbus-plc-data-repository'
import ReadHoldingRegistersRequestBody from 'jsmodbus/dist/request/read-holding-registers'
import { IUserRequestResolve } from 'jsmodbus/dist/user-request'
import { WriteSingleRegisterRequestBody } from 'jsmodbus/dist/request'

describe('ReadValue Modbus', () => {
    let socketMock : sinon.SinonStubbedInstance<Socket>
    let clientMock : sinon.SinonStubbedInstance<ModbusTCPClient>
    let mockMap : Map<string, (...args : []) => void>

    beforeEach(() => {
        clientMock = sinon.createStubInstance(ModbusTCPClient)
        socketMock = sinon.createStubInstance(Socket)
        mockMap = new Map()
        
        socketMock.once.callsFake((event : string, listener : () => void) => {
            mockMap.set(event, listener)
            return socketMock
        })
    })

    test('GIVEN repository WHEN error connecting to plc THEN twrow error', async () => {
        socketMock.connect.callsFake(() => {
            const errorMock : (err : Error) => void = mockMap.get('error')!
            errorMock(new Error())
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port:502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.readValue('A')).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN read value from plc THEN return number', async () => {
        const dummyResponse = {
            response: {
                body: {
                    values: [42]
                }
            }
        } as IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>

        clientMock.readHoldingRegisters.resolves(dummyResponse)
        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port:502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.readValue('A')).resolves.toBe(42)
    })
    test('GIVEN repository WHEN error reading value from plc THEN throws error', async () => {
        const mockError = new Error()
        clientMock.readHoldingRegisters.rejects(mockError)
        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port:502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.readValue('Z')).rejects.toThrow(Error)
    })
})

describe('ReadValues Modbus', () => {
    let clientMock: sinon.SinonStubbedInstance<ModbusTCPClient>
    let socketMock: sinon.SinonStubbedInstance<Socket>
    let mockMap : Map<string, ()=>void>

    beforeEach(() => {
        clientMock = sinon.createStubInstance(ModbusTCPClient)
        socketMock = sinon.createStubInstance(Socket)
        mockMap = new Map()
        socketMock.once.callsFake((event : string, listener : ()=>void) => {
            mockMap.set(event, listener)
            return socketMock as Socket
        })
    })

    test('GIVEN repository WHEN error connecting to plc THEN throws error', async () => {
        socketMock.connect.callsFake(() => {
            const mockError : (err : Error)=>void = mockMap.get('error')!
            mockError(new Error())
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.readValues()).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN read values from plc THEN return map with data', async () => {
        const dummyResponse = {
            response: {
                body: {
                    valuesAsArray: [11,22,33]
                }
            }
        } as IUserRequestResolve<ModbusTCPRequest<ReadHoldingRegistersRequestBody>>
        clientMock.readHoldingRegisters.resolves(dummyResponse)
        
        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        const result = new Map([['A', 11], ['B', 22], ['C', 33]])
        await expect(repository.readValues()).resolves.toEqual(result)
    })

    test('GIVEN repository WHEN error read from plc THEN throw error', async () => {
        clientMock.readHoldingRegisters.rejects(new Error())
        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.readValues()).rejects.toThrow(Error)
    })
})

describe('WriteValue Modbus', () => {
    let clientMock: sinon.SinonStubbedInstance<ModbusTCPClient>
    let socketMock: sinon.SinonStubbedInstance<Socket>
    let mockMap : Map<string, ()=>void>

    beforeEach(() => {
        clientMock = sinon.createStubInstance(ModbusTCPClient)
        socketMock = sinon.createStubInstance(Socket)
        mockMap = new Map()
        socketMock.once.callsFake((event : string, listener : ()=>void) => {
            mockMap.set(event, listener)
            return socketMock as Socket
        })
        
    })

    test('GIVEN repository WHEN error connecting to plc THEN throws error', async () => {
        socketMock.connect.callsFake(() => {
            const mockError : (err : Error) => void = mockMap.get('error')!
            mockError(new Error)
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })
        
        await expect(repository.writeValue('A', 10)).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN writing value THEN value update correctly', async () => {
        clientMock.writeSingleRegister.resolves(
            'write correctly' as unknown as IUserRequestResolve<ModbusTCPRequest<WriteSingleRegisterRequestBody>>
        )

        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.writeValue('1', 10)).resolves.toBeUndefined()
        expect(clientMock.writeSingleRegister.calledOnce).toBeTruthy()
        expect(clientMock.writeSingleRegister.firstCall.args).toEqual([1, 10])
    })

    test('GIVEN repository WHEN error writing value to plc THEN throw error', async () => {
        clientMock.writeSingleRegister.rejects(new Error())

        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        await expect(repository.writeValue('Z',11)).rejects.toThrow(Error)
    })
})

describe('WriteValues Modbus', () => {
    let clientMock: sinon.SinonStubbedInstance<ModbusTCPClient>
    let socketMock: sinon.SinonStubbedInstance<Socket>
    let mockMap : Map<string, ()=>void>

    beforeEach(() => {
        clientMock = sinon.createStubInstance(ModbusTCPClient)
        socketMock = sinon.createStubInstance(Socket)
        mockMap = new Map()
        socketMock.once.callsFake((event : string, listener : ()=>void) => {
            mockMap.set(event, listener)
            return socketMock as Socket
        })
    })

    test('GIVEN repository WHEN error connecting to plc THEN throw error', async () => {
        socketMock.connect.callsFake(() => {
            const mockError: (err : Error) => void = mockMap.get('error')!
            mockError(new Error())
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN writing values THEN values update correctly', async () => {
        clientMock.writeSingleRegister.resolves(
            'write correctly' as unknown as IUserRequestResolve<ModbusTCPRequest<WriteSingleRegisterRequestBody>>
        )

        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).resolves.toBeUndefined()
        expect(clientMock.writeSingleRegister.called).toBeTruthy()
        expect(clientMock.writeSingleRegister.firstCall.args).toEqual([0, 11])
        expect(clientMock.writeSingleRegister.secondCall.args).toEqual([1, 22])
    })

    test('GIVEN repository WHEN error writting value to plc THEN throw error', async () => {
        clientMock.writeSingleRegister.rejects(new Error())

        socketMock.connect.callsFake(() => {
            mockMap.get('connect')!()
            return socketMock
        })

        const repository = new ModbusPlcDataRepository({
            host: 'localhost',
            port: 502,
            socket: socketMock,
            client: clientMock
        })

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).rejects.toThrow(Error)
    })
})
