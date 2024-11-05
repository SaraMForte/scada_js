import { beforeAll, beforeEach, describe, expect, test } from 'vitest'
import {
    PropertyError,
    PropertyNotFoundError,
    PropertyWriteError,
    RepeatedPropertyError
} from '../../main/application/errors'
import ModbusPlcDataRepository from '../../main/infrastructure/modbus-plc-data-repository'
import PlcDataRepository from '../../main/application/plc-data-repository'
import PlcDataService, { PlcDatasResoult } from '../../main/application/plc-data-service'
import sinon from 'sinon'

const DUMMY_DATA_OBJ_1 = {
    A: 5,
    B: 8,
    C: 34,
    D: 21,
    E: 24
}
const DUMMY_DATA_OBJ_2 = {
    F: 77,
    I: 23,
    W: 36
}

class DummyPlcDataRepository implements PlcDataRepository {
    dummyData: { [key: string]: number }

    constructor(dummyData: { [key: string]: number }) {
        this.dummyData = dummyData
    }

    async readValue(property: string): Promise<number> {
        const value = this.dummyData[property]
        if (value === undefined) {
            throw new PropertyNotFoundError(property)
        }
        return value
    }
    async readValues(): Promise<Map<string, number>> {
        const values = Object.entries(this.dummyData)
        const valuesMap = new Map(values)

        return valuesMap
    }
    async writeValue(property: string, value: number): Promise<void> {
        this.dummyData[property] = value
        return
    }
    async writeValues(valuesMap: Map<string, number>): Promise<void> {
        for (const [property, value] of valuesMap) {
            this.dummyData[property] = value
        }
    }
}

class DummyPlcErrorRepository implements PlcDataRepository {
    async readValue(): Promise<number> {
        return new Promise(() => {
            throw new PropertyNotFoundError('propertyName')
        })
    }

    async readValues(): Promise<Map<string, number>> {
        return new Promise(() => {
            throw new PropertyNotFoundError('propertyName')
        })
    }

    writeValue(): Promise<void> {
        throw new Error('Method not implemented.')
    }

    writeValues(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}

class DummyErrorWriteRepository implements PlcDataRepository {
    async readValue(): Promise<number> {
        return 25
    }

    async writeValue(): Promise<void> {
        return new Promise(() => {
            throw new PropertyWriteError('propertyName', 20)
        })
    }

    readValues(): Promise<Map<string, number>> {
        throw new Error('Method not implemented.')
    }
    writeValues(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
//-----------------------------------------------------{Creation}-------------------------------------------------------
describe('Creation', () => {
    let dummyPlcData1Repository: DummyPlcDataRepository
    let dummyPlcData2Repository: DummyPlcDataRepository

    beforeAll(() => {
        dummyPlcData1Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_1
        })
        dummyPlcData2Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_2
        })
    })

    test('GIVEN one PlcDataRepository WHEN create service THEN is created', () => {
        const plcDataService = new PlcDataService(dummyPlcData2Repository)

        expect(plcDataService).toBeDefined()
    })
    test('GIVEN multiple PlcDataRepository WHEN create service THEN is created', () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        expect(plcDataService).toBeDefined()
    })
})
//-----------------------------------------------------{ReadValue}------------------------------------------------------
describe('Readvalue', () => {
    let dummyPlcData1Repository: DummyPlcDataRepository
    let dummyPlcData2Repository: DummyPlcDataRepository

    beforeAll(() => {
        dummyPlcData1Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_1
        })
        dummyPlcData2Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_2
        })
    })

    test('GIVEN properties with values WHEN read an existing property THEN returns property value', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        expect(await plcDataService.readValue('A')).toBe(5)
        expect(await plcDataService.readValue('C')).toBe(34)
        expect(await plcDataService.readValue('F')).toBe(77)
        expect(await plcDataService.readValue('W')).toBe(36)
    })

    test('GIVEN properties with values WHEN read an non-existing property THEN throws error', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, new DummyPlcDataRepository({}))

        await expect(plcDataService.readValue('Z')).rejects.toThrow(PropertyNotFoundError)
    })

    test('GIVEN properties with values WHEN read a property duplicated across multiple Plc THEN throws error', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData1Repository)

        await expect(plcDataService.readValue('A')).rejects.toThrow(RepeatedPropertyError)
    })
})
//-----------------------------------------------------{ReadValues}-----------------------------------------------------
describe('ReadValues', () => {
    const DUMMY_DATA_ARRAY_1 = Object.entries(DUMMY_DATA_OBJ_1)
    const DUMMY_DATA_ARRAY_2 = Object.entries(DUMMY_DATA_OBJ_2)
    const DUMMY_DATA_MAP = new Map([...DUMMY_DATA_ARRAY_1, ...DUMMY_DATA_ARRAY_2])

    let dummyPlcData1Repository: DummyPlcDataRepository
    let dummyPlcData2Repository: DummyPlcDataRepository

    beforeAll(() => {
        dummyPlcData1Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_1
        })
        dummyPlcData2Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_2
        })
    })

    test('GIVEN repository with empty data WHEN reading all properties THEN return no data with no errors', async () => {
        const plcDataService = new PlcDataService()

        const dummyValues: PlcDatasResoult = { data: new Map(), error: [] }
        expect(await plcDataService.readValues()).toEqual(dummyValues)
    })

    test('GIVEN repositories with data WHEN reading all properties THEN return data with no errors', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        const dummyValues3: PlcDatasResoult = {
            data: DUMMY_DATA_MAP,
            error: []
        }
        expect(await plcDataService.readValues()).toEqual(dummyValues3)
    })

    test('GIVEN repositories with data WHEN reading specific data THEN return data with no errors', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        const dummyValues1 = { data: new Map(DUMMY_DATA_ARRAY_1), error: [] }
        const dummyValues2 = { data: new Map(DUMMY_DATA_ARRAY_2), error: [] }
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_OBJ_1))).toEqual(dummyValues1)
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_OBJ_2))).toEqual(dummyValues2)
    })

    test('GIVEN repositories with error to read WHEN attempting to read PLCs THEN returns no data with errors', async () => {
        const plcDataService = new PlcDataService(new DummyPlcErrorRepository(), new DummyPlcErrorRepository())

        const dummyValues: PlcDatasResoult = {
            data: new Map(),
            error: [new Error(), new Error()]
        }

        const expectReadValues = await plcDataService.readValues()
        expect(expectReadValues.data).toEqual(dummyValues.data)
        expect(expectReadValues.error.length).toBe(dummyValues.error.length)
        expectReadValues.error.forEach(err => expect(err).toBeInstanceOf(Error))
    })

    test('GIVEN repositories with data WHEN reading a non-existing specific properties THEN returns empty data with errors', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData1Repository)

        const dummyErrors2 = DUMMY_DATA_ARRAY_2.map(() => new ReferenceError())
        const dummyValues2: PlcDatasResoult = {
            data: new Map(),
            error: dummyErrors2
        }

        const expectReadValues = await plcDataService.readValues(Object.keys(DUMMY_DATA_OBJ_2))
        expect(expectReadValues.data).toEqual(dummyValues2.data)
        expect(expectReadValues.error.length).toBe(dummyValues2.error.length)
        expectReadValues.error.forEach(err => expect(err).toBeInstanceOf(Error))
    })

    test('GIVEN repositories with data and error to read WHEN reading all properties THEN return data with errors', async () => {
        const plcDataService = new PlcDataService(new DummyPlcErrorRepository(), dummyPlcData2Repository)

        const expectReadValues = await plcDataService.readValues()
        expect(expectReadValues.error.length).toBeGreaterThan(0)
        expect(expectReadValues.data.size).toBeGreaterThan(0)
    })

    test('GIVEN repositories with duplicated data in multiple PLCs WHEN reading all properties THEN return data and errors', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData1Repository)

        const dummyErrors: Error[] = DUMMY_DATA_ARRAY_1.map(() => new Error())
        const dummyValues = {
            data: new Map(DUMMY_DATA_ARRAY_1),
            error: dummyErrors
        }

        const expectReadValues = await plcDataService.readValues()
        expect(expectReadValues.data).toEqual(dummyValues.data)
        expectReadValues.error.forEach(err => expect(err).toEqual(expect.any(Error)))
    })
})
//-----------------------------------------------------{WriteValue}-----------------------------------------------------
describe('writeValue', () => {
    let dummyPlcData1Repository: DummyPlcDataRepository
    let dummyPlcData2Repository: DummyPlcDataRepository

    beforeEach(() => {
        dummyPlcData1Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_1
        })
        dummyPlcData2Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_2
        })
    })

    test('GIVEN repositories with data WHEN writing existing property THEN properties updated correctly', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        await plcDataService.writeValue('A', 20)
        expect(dummyPlcData1Repository.dummyData['A']).toBe(20)
        expect(dummyPlcData2Repository.dummyData['A']).not.toBe(20)

        await plcDataService.writeValue('W', 30)
        expect(dummyPlcData2Repository.dummyData['W']).toBe(30)
        expect(dummyPlcData1Repository.dummyData['W']).not.toBe(30)
    })

    test('GIVEN repositories with data WHEN writing non-existing property THEN throws error', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        await expect(plcDataService.writeValue('Z', 40)).rejects.toThrow(PropertyNotFoundError)
    })

    test('GIVEN repositories with duplicated data WHEN writing existing property THEN throws error', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData1Repository)

        await expect(plcDataService.writeValue('A', 50)).rejects.toThrow(Error)
        await expect(plcDataService.writeValue('C', 50)).rejects.toThrow(Error)
    })

    test('GIVEN repositories with data WHEN fail to write properties THEN throws error', async () => {
        const plcDataService = new PlcDataService(new DummyErrorWriteRepository())

        await expect(plcDataService.writeValue('A', 60)).rejects.toThrow(PropertyWriteError)
    })

    test('GIVEN repositories with data WHEN faul to write property and throw unknown error THEN throw unknown', async () => {
        const mockError = new Error('Unknown Error')
        const mockRepository = sinon.createStubInstance(DummyErrorWriteRepository)
        const plcDataService = new PlcDataService(mockRepository)

        mockRepository.readValue.rejects(mockError)

        await expect(plcDataService.writeValue('A', 60)).rejects.toThrow(mockError)
    })
})

//-----------------------------------------------------{WriteValues}----------------------------------------------------
describe('writeValues', () => {
    const DUMMY_DATA_ARRAY_1 = Object.entries(DUMMY_DATA_OBJ_1)
    const DUMMY_DATA_ARRAY_2 = Object.entries(DUMMY_DATA_OBJ_2)

    let dummyDataMap1: Map<string, number>
    let dummyDataMap2: Map<string, number>
    let dummyPlcData1Repository: DummyPlcDataRepository
    let dummyPlcData2Repository: DummyPlcDataRepository

    beforeEach(() => {
        dummyDataMap1 = new Map(DUMMY_DATA_ARRAY_1)
        dummyDataMap2 = new Map(DUMMY_DATA_ARRAY_2)
        dummyPlcData1Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_1
        })
        dummyPlcData2Repository = new DummyPlcDataRepository({
            ...DUMMY_DATA_OBJ_2
        })
    })

    test('GIVEN repositories with mapped data WHEN writing existing properties THEN properties are updated correctly', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        const dummyAddData1Map = new Map([
            ['A', 13],
            ['B', 14],
            ['C', 15]
        ])
        const dummyAddData2Map = new Map([
            ['F', 10],
            ['I', 11]
        ])
        const dummyDataMap = new Map([...dummyAddData1Map, ...dummyAddData2Map])

        dummyAddData1Map.forEach((value, property) => {
            if (dummyDataMap1.has(property)) {
                dummyDataMap1.set(property, value)
            }
        })
        dummyAddData2Map.forEach((value, property) => {
            if (dummyDataMap2.has(property)) {
                dummyDataMap2.set(property, value)
            }
        })

        await plcDataService.writeValues(dummyDataMap)
        const dummyValues1Map = new Map(Object.entries(dummyPlcData1Repository.dummyData))
        const dummyValues2Map = new Map(Object.entries(dummyPlcData2Repository.dummyData))

        expect(dummyValues1Map).toEqual(dummyDataMap1)
        expect(dummyValues2Map).toEqual(dummyDataMap2)
    })

    test('GIVEN repositories with mapped data WHEN writing exisiting properties THEN properties return errors', async () => {
        const plcDataService = new PlcDataService(dummyPlcData1Repository, dummyPlcData2Repository)

        const dummyAddData1Map = new Map([
            ['A', 13],
            ['B', 14],
            ['C', 15]
        ])
        const dummyAddData2Map = new Map([
            ['F', 10],
            ['I', 11],
            ['Z', 16],
            ['X', 17]
        ])
        const dummyDataMap = new Map([...dummyAddData1Map, ...dummyAddData2Map])

        const writeResults = await plcDataService.writeValues(dummyDataMap)
        expect(writeResults.length).toBe(2)
        writeResults.forEach(error => expect(error).toEqual(expect.any(PropertyError)))
    })

    test('GIVEN repository WHEN fail attempting to write values THEN return errors', async () => {
        const mockRepository = sinon.createStubInstance(ModbusPlcDataRepository)
        const plcDataService = new PlcDataService(mockRepository)

        const dummyDataMap = new Map([
            ['A', 13],
            ['B', 14],
            ['C', 15]
        ])
        const mockError = new PropertyWriteError('test Error', 'test value')

        mockRepository.writeValues.throws(mockError)
        mockRepository.readValue.resolves(11)

        const result = await plcDataService.writeValues(dummyDataMap)
        expect(result.length).toBe(3)
        result.forEach(err => expect(err).toEqual(expect.any(PropertyWriteError)))
    })

    test('GIVEN repository WHEN fail attempting to write values with unknown error THEN throws unknown error', async () => {
        const dummyDataMap = new Map([['A', 13]])
        const mockErrorRead = new Error('strange error test')

        const mockRepository = sinon.createStubInstance(ModbusPlcDataRepository)
        const plcDataService = new PlcDataService(mockRepository)

        mockRepository.readValue.rejects(mockErrorRead)

        await expect(plcDataService.writeValues(dummyDataMap)).rejects.toThrow(mockErrorRead)
    })
})
