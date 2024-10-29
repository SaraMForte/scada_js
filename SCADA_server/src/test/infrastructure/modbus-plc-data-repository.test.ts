import { Socket } from 'net'
import sinon from 'sinon'
import { ModbusTCPClient, ModbusTCPRequest } from 'jsmodbus'
import { beforeEach, describe, expect, test} from 'vitest'
import ModbusPlcDataRepository from '../../main/infrastructure/modbus-plc-data-repository'
import ReadHoldingRegistersRequestBody from 'jsmodbus/dist/request/read-holding-registers'
import { IUserRequestResolve } from 'jsmodbus/dist/user-request'
import { WriteSingleRegisterRequestBody } from 'jsmodbus/dist/request'
import { StandloneModbusClientPool } from '../../main/infrastructure/modbus-client-pool'
import { StandloneModbusClient } from '../../main/infrastructure/standlone-modbus-client'

function createStandloneModbusClientFactory(
    configure : (
        standloneModbusClient : sinon.SinonStubbedInstance<StandloneModbusClient>, 
        mockMap : Map<string, (...args : any[]) => void>
    ) => void
) {
    return () => {
        const standloneModbusClient = sinon.createStubInstance(StandloneModbusClient)
        const mockMap = new Map()
        standloneModbusClient.once.callsFake((eventName : string, callback: (...args : any[]) => void) => {
            mockMap.set(eventName, callback)
            return standloneModbusClient
        })
        configure(standloneModbusClient, mockMap)
        return standloneModbusClient
    }
}

describe('ReadValue Modbus', () => {
    test('GIVEN repository WHEN error connecting to plc THEN twrow error', async () => {
        const repository = new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock, mockMap) => {
                standloneModbusClientMock.connect.callsFake(() => {
                    const errorMock : (err : Error) => void = mockMap.get('error')!
                    errorMock(new Error())
                    return standloneModbusClientMock
                })
            }), 1
        ))

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

        const repository = new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock) => {
                standloneModbusClientMock.readHoldingRegisters.resolves(dummyResponse)
                standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                    callback!()
                    return standloneModbusClientMock
                })
            }), 1
        ))

        await expect(repository.readValue('A')).resolves.toBe(42)
    })

    test('GIVEN repository WHEN error reading value from plc THEN throws error', async () => {
        const mockError = new Error()
        const repository = new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock) => {
                standloneModbusClientMock.readHoldingRegisters.rejects(mockError)
                standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                    callback!()
                    return standloneModbusClientMock
                })
            }), 1
        ))

        await expect(repository.readValue('Z')).rejects.toThrow(Error)
    })
})

describe('ReadValues Modbus', () => {
    test('GIVEN repository WHEN error connecting to plc THEN throws error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock, mockMap) => {
                standloneModbusClientMock.connect.callsFake(() => {
                    const errorMock : (err : Error) => void = mockMap.get('error')!
                    errorMock(new Error())
                    return standloneModbusClientMock
                })
            }), 1
        ))

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
        const repository = new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock) => {
                standloneModbusClientMock.readHoldingRegisters.resolves(dummyResponse)
                standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                    callback!()
                    return standloneModbusClientMock
                })
            }), 1
        ))

        const result = new Map([['A', 11], ['B', 22], ['C', 33]])
        await expect(repository.readValues()).resolves.toEqual(result)
    })

    test('GIVEN repository WHEN error read from plc THEN throw error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock, mockMap) => {
                standloneModbusClientMock.readHoldingRegisters.rejects(new Error())
                standloneModbusClientMock.connect.callsFake(() => {
                    const errorMock : (err : Error) => void = mockMap.get('error')!
                    errorMock(new Error())
                    return standloneModbusClientMock
                })
            }), 1
        ))

        await expect(repository.readValues()).rejects.toThrow(Error)
    })
})

describe('WriteValue Modbus', () => {
    test('GIVEN repository WHEN error connecting to plc THEN throws error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock, mockMap) => {
                standloneModbusClientMock.connect.callsFake(() => {
                    const errorMock : (err : Error) => void = mockMap.get('error')!
                    errorMock(new Error())
                    return standloneModbusClientMock
                })
            }), 1
        ))
        
        await expect(repository.writeValue('A', 10)).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN writing value THEN value update correctly', async () => {
        const standloneModbusClientMock = createStandloneModbusClientFactory((standloneModbusClientMock) => {
            standloneModbusClientMock.writeSingleRegister.resolves(
                'write correctly' as unknown as IUserRequestResolve<ModbusTCPRequest<WriteSingleRegisterRequestBody>>
            )
            standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                callback!()
                return standloneModbusClientMock
            })
        })()
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            () => standloneModbusClientMock, 1
        ))

        await expect(repository.writeValue('1', 10)).resolves.toBeUndefined()
        expect(standloneModbusClientMock.writeSingleRegister.calledOnce).toBeTruthy()
        expect(standloneModbusClientMock.writeSingleRegister.firstCall.args).toEqual([1, 10])
    })

    test('GIVEN repository WHEN error writing value to plc THEN throw error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock) => {
                standloneModbusClientMock.writeSingleRegister.rejects(new Error())
                standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                    callback!()
                    return standloneModbusClientMock
                })
            }), 1
        ))

        await expect(repository.writeValue('Z',11)).rejects.toThrow(Error)
    })
})

describe('WriteValues Modbus', () => {
    test('GIVEN repository WHEN error connecting to plc THEN throw error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock, mockMap) => {
                standloneModbusClientMock.connect.callsFake(() => {
                    const errorMock : (err : Error) => void = mockMap.get('error')!
                    errorMock(new Error())
                    return standloneModbusClientMock
                })
            }), 1
        ))

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).rejects.toThrow(Error)
    })

    test('GIVEN repository WHEN writing values THEN values update correctly', async () => {
        const standloneModbusClientMock = createStandloneModbusClientFactory((standloneModbusClientMock) => {
            standloneModbusClientMock.writeSingleRegister.resolves(
                'write correctly' as unknown as IUserRequestResolve<ModbusTCPRequest<WriteSingleRegisterRequestBody>>
            )
            standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                callback!()
                return standloneModbusClientMock
            })
        })()
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            () => standloneModbusClientMock, 1
        ))

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).resolves.toBeUndefined()
        expect(standloneModbusClientMock.writeSingleRegister.called).toBeTruthy()
        expect(standloneModbusClientMock.writeSingleRegister.firstCall.args).toEqual([0, 11])
        expect(standloneModbusClientMock.writeSingleRegister.secondCall.args).toEqual([1, 22])
    })

    test('GIVEN repository WHEN error writting value to plc THEN throw error', async () => {
        const repository =  new ModbusPlcDataRepository(new StandloneModbusClientPool(
            createStandloneModbusClientFactory((standloneModbusClientMock) => {
                standloneModbusClientMock.writeSingleRegister.rejects(new Error())
                standloneModbusClientMock.connect.callsFake((callback?: (...args: []) => void) => {
                    callback!()
                    return standloneModbusClientMock
                })
            }), 1
        ))

        const mapResult = new Map([['A', 11], ['B', 22]])
        await expect(repository.writeValues(mapResult)).rejects.toThrow(Error)
    })
})