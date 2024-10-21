import { describe, expect, test } from "@jest/globals"

import NamedPlcDataRepository from "../main/application/named-plc-data-repository"
import NamedPlcDataService, { PlcDatasResoult } from "../main/application/named-plc-data-service"
import { PropertyError, PropertyNotFoundError, PropertyWriteError, RepositoryNotFoundError } from "../main/application/errors"

const DUMMY_DATA_1 = {
    P : 13,
    J : 84,
    K : 26,
    L : 217,
    G : 247
}
const DUMMY_DATA_2 = {
    X : 777,
    Y : 236,
    W : 93
}

class DummyNamedPlcDataRepository implements NamedPlcDataRepository {
    plcName: string
    dummyData : {[key : string] : number}

    constructor(plcName : string, dummyData : {[key : string] : number}) {
        this.plcName = plcName
        this.dummyData = dummyData
    }

    async readValue(property: string): Promise<number> {
        if(property in this.dummyData) {
            return this.dummyData[property] ?? 0
        }
        throw new PropertyNotFoundError(property)
    }

    async readValues(): Promise<Map<string, number>> {
        const dummyDataArray = Object.entries(this.dummyData)
        return new Map(dummyDataArray)
    }

    async writeValue(property: string, value: number): Promise<void> {
        this.dummyData[property] = value
    }
    async writeValues(valuesMap: Map<string, number>): Promise<void> {
        for (const [property, value] of valuesMap) {
            this.dummyData[property] = value
        }
    }   
}

class DummyNamedPlcErrorRepository implements NamedPlcDataRepository {
    plcName: string
    dummyData : {[key : string] : number}
    
    constructor(plcName : string, dummyData : {[key : string] : number}) {
        this.plcName = plcName
        this.dummyData = dummyData
    }

    readValue = jest.fn().mockRejectedValue(new PropertyNotFoundError('propertyName'))
    
    readValues = jest.fn().mockRejectedValue(new PropertyNotFoundError('propertyName'))

    writeValue = jest.fn().mockRejectedValue(new PropertyWriteError('propertyName', 0))

    writeValues(valuesMap: Map<string, number>): Promise<void> {
        throw new Error("Method not implemented.")
    }
}

describe('Creation', () => {
    const dummyRepository1 = new DummyNamedPlcDataRepository('dummyPlc1', DUMMY_DATA_1)
    const dummyRepository2 = new DummyNamedPlcDataRepository('dummyPlc2', DUMMY_DATA_2)

    test('GIVEN one NamedPlcDataRepository WHEN create a service THE is created', async () => {
        const plcDataService = new NamedPlcDataService(dummyRepository1)

        expect(plcDataService).toBeDefined()
    })

    test('GIVEN multiple NamedPlcDataRepository WHEN create a service THE is created', async () => {
        const plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)

        expect(plcDataService).toBeDefined()
    })

    test('GIVEN multiple NamedPlcDataReposity when take plc names THEN return array of names', () => {
        const plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)

        expect(plcDataService.getPlcNames).toEqual(['dummyPlc1','dummyPlc2'])
    })

})

describe('ReadValue', () => {
    const dummyRepository1 = new DummyNamedPlcDataRepository('dummyPlc1', DUMMY_DATA_1)
    const dummyRepository2 = new DummyNamedPlcDataRepository('dummyPlc2', DUMMY_DATA_2)
    const dummyErrorRepository1 = new DummyNamedPlcErrorRepository('dummyPlc1', DUMMY_DATA_1)
    const dummyErrorRepository2 = new DummyNamedPlcErrorRepository('dummyPlc2', DUMMY_DATA_2)

    const plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)
    const plcErrorService = new NamedPlcDataService(dummyErrorRepository1, dummyErrorRepository2)

    test('GIVEN properties with values WHEN read an existing property THEN return property value', async () => {
        expect(await plcDataService.readValue('dummyPlc1', 'P')).toBe(13)
        expect(await plcDataService.readValue('dummyPlc2', 'X')).toBe(777)
    })

    test('GIVEN properties with values WHEN read from a non-existing plc repository THEN throws error', async () => {
        await expect(plcDataService.readValue('dummyPlc3', 'P')).rejects.toThrow(RepositoryNotFoundError)
    })

    test('GIVEN properties with values WHEN read an non-existing property THEN throws error', async () => {
        await expect(plcErrorService.readValue('dummyPlc1', 'Y')).rejects.toThrow(PropertyError)
        await expect(plcErrorService.readValue('dummyPlc2', 'J')).rejects.toThrow(PropertyError)
    })
})

describe('ReadValues', () => {
    const dummyRepository1 = new DummyNamedPlcDataRepository('dummyPlc1', DUMMY_DATA_1)
    const dummyRepository2 = new DummyNamedPlcDataRepository('dummyPlc2', DUMMY_DATA_2)

    const dummyErrorRepository1 = new DummyNamedPlcErrorRepository('dummyPlc1', DUMMY_DATA_1)
    const dummyErrorRepository2 = new DummyNamedPlcErrorRepository('dummyPlc2', DUMMY_DATA_2)

    const DUMMY_DATA_ARRAY_1 = Object.entries(DUMMY_DATA_1)
    const DUMMY_DATA_ARRAY_2 = Object.entries(DUMMY_DATA_2)

    const plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)
    const plcErrorService = new NamedPlcDataService(dummyErrorRepository1, dummyErrorRepository2)

    test('GIVEN properties with values WHEN read from non-exisitng plc repositorty THEN throws error', async () => {
        await expect(plcDataService.readValues('dummyPlc3')).rejects.toThrow(RepositoryNotFoundError)
        await expect(plcDataService.readValues('')).rejects.toThrow(RepositoryNotFoundError)
    })

    test('GIVEN repositories with empty data WHEN read all properties THEN return no data and empty error', 
    async () => {
        const plcDataEmptyService = new NamedPlcDataService(
            new DummyNamedPlcDataRepository('dummyPlc1', {}),
            new DummyNamedPlcDataRepository('dummyPlc2', {})
        )
        const dummyValues : PlcDatasResoult = {data : new Map(), error : []}
        
        expect(await plcDataEmptyService.readValues('dummyPlc1')).toEqual(dummyValues)
        expect(await plcDataEmptyService.readValues('dummyPlc2')).toEqual(dummyValues)
    })

    test('GIVEN properties with values WHEN read all properties of repositories THEN return data and empty error',
    async () => {
        const dummyValues1 : PlcDatasResoult = {data : new Map(DUMMY_DATA_ARRAY_1), error : []}
        const dummyValues2 : PlcDatasResoult = {data : new Map(DUMMY_DATA_ARRAY_2), error : []}

        expect(await plcDataService.readValues('dummyPlc1')).toEqual(dummyValues1)
        expect(await plcDataService.readValues('dummyPlc2')).toEqual(dummyValues2)
    })

    test('GIVEN properties with values WHEN real specific properties of repositories THEN return data and empty error',
    async () => {
        const dummyMap = new Map([['P', 13], ['J', 84], ['K', 26]])
        const dummyKeys : string[] = Array.from(dummyMap.keys())
        const dummyValues : PlcDatasResoult = {data : dummyMap, error : []}

        expect(await plcDataService.readValues('dummyPlc1', dummyKeys)).toEqual(dummyValues)
    })
    
    test('GIVEN properties with values WHEN attempting to read all properties THEN return empty data with errors', 
    async () => {
        const result2 = await plcErrorService.readValues('dummyPlc2')
        expect(result2.data).toEqual(new Map())
        expect(result2.error.length).toEqual(1)
        result2.error.forEach(err => expect(err).toEqual(expect.any(Error)))
    })

    test('GIVEN properties with values WHEN attempting to read specific properties THEN returns empty data with errors',
        async () => {
        const dummyMap = new Map([['L', 217], ['G', 247]])
        const dummyKeys : string[] = Array.from(dummyMap.keys())

        const result1 = await plcErrorService.readValues('dummyPlc1', dummyKeys)
        expect(result1.data).toEqual(new Map())
        expect(result1.error.length).toEqual(dummyMap.size)
        result1.error.forEach(err => expect(err).toEqual(expect.any(Error)))
    })

    test('GIVEN propertie with values WHEN read existing and non-exisitng properties THEN return data and errors', 
    async () => {
        const dummyMap = new Map([['L', 217], ['G', 247], ['Z', 10], ['A', 11]])
        const dummyKeys : string[] = Array.from(dummyMap.keys())
        const dummyMapResult = new Map([['L', 217], ['G', 247]])

        const result = await plcDataService.readValues('dummyPlc1', dummyKeys)
        expect(result.data).toEqual(dummyMapResult)
        expect(result.error.length).toEqual(2)
        result.error.forEach(err => expect(err).toEqual(expect.any(Error)))
    })
})

describe('WriteValue', () => {
    let dummyRepository1 : DummyNamedPlcDataRepository
    let dummyRepository2 : DummyNamedPlcDataRepository

    let dummyErrorRepository1 : DummyNamedPlcErrorRepository
    let dummyErrorRepository2 : DummyNamedPlcErrorRepository

    let plcDataService: NamedPlcDataService
    let plcErrorService : NamedPlcDataService

    beforeEach(() => {
        dummyRepository1 = new DummyNamedPlcDataRepository('dummyPlc1', {...DUMMY_DATA_1})
        dummyRepository2 = new DummyNamedPlcDataRepository('dummyPlc2', {...DUMMY_DATA_2})
    
        dummyErrorRepository1 = new DummyNamedPlcErrorRepository('dummyPlc1', {...DUMMY_DATA_1})
        dummyErrorRepository2 = new DummyNamedPlcErrorRepository('dummyPlc2', {...DUMMY_DATA_2})
    
        plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)
        plcErrorService = new NamedPlcDataService(dummyErrorRepository1, dummyErrorRepository2) 
    })

    test('GIVEN properties with values WHEN read from non-exisitng plc repositorty THEN return error', async () => {
        await expect(plcDataService.writeValue('dummyPlc3', 'K', 28)).rejects.toThrow(RepositoryNotFoundError)
        await expect(plcDataService.writeValue('', 'K', 28)).rejects.toThrow(RepositoryNotFoundError)
    })
    
    test('GIVEN repositories with data WHEN writiting existing property THEN property updated correctly', async () => {
        await plcDataService.writeValue('dummyPlc1', 'K', 28)
        expect(dummyRepository1.dummyData['K']).toBe(28)
        expect(dummyRepository2.dummyData['K']).not.toBe(28)

        await plcDataService.writeValue('dummyPlc2', 'Y', 29)
        expect(dummyRepository2.dummyData['Y']).toBe(29)
        expect(dummyRepository1.dummyData['Y']).not.toBe(29)        
    })

    test('GIVEN repositories with data WHEN writing non-existing property THEN throws error', async () => {
        await expect(plcErrorService.writeValue('dummyPlc1', 'Z', 5)).rejects.toThrow(PropertyWriteError)
        await expect(plcErrorService.writeValue('dummyPlc1', 'A', 21)).rejects.toThrow(PropertyWriteError)
    })
})

describe('WriteValues', () => {
    let dummyRepository1 : DummyNamedPlcDataRepository
    let dummyRepository2 : DummyNamedPlcDataRepository

    let dummyErrorRepository1 : DummyNamedPlcErrorRepository
    let dummyErrorRepository2 : DummyNamedPlcErrorRepository

    let plcDataService: NamedPlcDataService
    let plcErrorService : NamedPlcDataService

    beforeEach(() => {
        dummyRepository1 = new DummyNamedPlcDataRepository('dummyPlc1', {...DUMMY_DATA_1})
        dummyRepository2 = new DummyNamedPlcDataRepository('dummyPlc2', {...DUMMY_DATA_2})
    
        dummyErrorRepository1 = new DummyNamedPlcErrorRepository('dummyPlc1', {...DUMMY_DATA_1})
        dummyErrorRepository2 = new DummyNamedPlcErrorRepository('dummyPlc2', {...DUMMY_DATA_2})
    
        plcDataService = new NamedPlcDataService(dummyRepository1, dummyRepository2)
        plcErrorService = new NamedPlcDataService(dummyErrorRepository1, dummyErrorRepository2) 
    })

    test('GIVEN properties with values WHEN read from non-exisitng plc repositorty THEN return error', async () => {
        const dummyMap = new Map([['J', 71], ['K', 72]])

        await expect(plcDataService.writeValues('dummyPlc3', dummyMap)).rejects.toThrow(RepositoryNotFoundError)
        await expect(plcDataService.writeValues('', dummyMap)).rejects.toThrow(RepositoryNotFoundError)
    })

    test('GIVEN repositories with data WHEN writing existing properties THEN return no errors', async () => {
        const dummyMap1 = new Map([['J', 71], ['K', 72]])

        const writeResult = await plcDataService.writeValues('dummyPlc1', dummyMap1)
        expect(dummyRepository1.dummyData['J']).toBe(71)
        expect(dummyRepository2.dummyData['J']).not.toBe(71)
        expect(dummyRepository1.dummyData['K']).toBe(72)
        expect(dummyRepository2.dummyData['K']).not.toBe(72)
        expect(writeResult.length).toBe(0)
        writeResult.forEach(err => expect(err).toEqual(expect.any(PropertyError)))
    })

    test('GIVEN repositories with data when attempt writting existing properties THEN return errors', async () => {
        const dummyMap = new Map([['J', 71], ['K', 72]])

        const writeResults = await plcErrorService.writeValues('dummyPlc1',dummyMap)
        expect(writeResults.length).toBe(2)
        writeResults.forEach(error => expect(error).toEqual(expect.any(PropertyError)))
    })
})