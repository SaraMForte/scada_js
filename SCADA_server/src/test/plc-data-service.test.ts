import {describe, expect, test} from '@jest/globals';

import PlcDataService, { PlcDatasResoult } from '../main/application/plc-data-service';
import PlcDataRepository from '../main/application/plc-data-repository';

const DUMMY_DATA_1 = {
    A : 5,
    B : 8,
    C : 2,
    D : 21,
    E : 24
}
const DUMMY_DATA_2 = {
    F : 77,
    I : 23,
    W : 9
}

class DummyPlcDataRepository implements PlcDataRepository {
    dummyData : {[key : string] : number}

    constructor(dummyData : {[key : string] : number}) {
        this.dummyData = dummyData
    }

    async readValue(property: string): Promise<number> {
        const value = this.dummyData[property]
        if(value === undefined) {
            throw new ReferenceError(`value of property ${property} is not been reached`)
        }
        return value
    }
    async readValues(): Promise<Map<string, number>> {
        const values = Object.entries(this.dummyData)
        const valuesMap = new Map(values)

        return valuesMap
    }
    async writeValue(property: string, value: number): Promise<void> {
        if(!(property in this.dummyData)) {
            throw new TypeError('Property value not be write')
        }
        this.dummyData[property] = value

        return
    }
    async writeValues(valuesMap: Map<string, number>): Promise<void> {
        for(const property in valuesMap) {
            if (!(property in this.dummyData)) {
                throw new TypeError('Property value not be write')
            }
        }
        for (const [property, value] of valuesMap) {
            this.dummyData[property] = value
        }

        return 
    }
    
}
const dummyRepositoryConnectionError: PlcDataRepository = {
    readValue: jest.fn().mockRejectedValue(new Error('Function not implemented.')),
    readValues: jest.fn().mockResolvedValue(new ReferenceError('failed to read values')),
    writeValue: jest.fn().mockRejectedValue(new Error('Function not implemented.')),
    writeValues: jest.fn().mockRejectedValue(new Error('Function not implemented.'))
}        

describe('Creation', () => {
    test('with one PlcDataRepository', () => {
        const plcDataServiceData = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_2))
    })
    test('with multiple PlcDataRepository', () => {
        const plcDataServiceData = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1), new DummyPlcDataRepository(DUMMY_DATA_2))
    })
})

describe('Readvalue', () => {
    test('from one PlcDataService with one PLCDataRepository ', async () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1))
        expect(await plcDataService.readValue('A')).toBe(5)
        expect(await plcDataService.readValue('C')).toBe(2)
        
        await expect(plcDataService.readValue('Z')).rejects.toThrow(new ReferenceError(`value of property Z is not been reached`))    

    })
    test('from one PlcDataService with multiple PlcDataRepository ', async () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1), new DummyPlcDataRepository(DUMMY_DATA_2))

        expect(await plcDataService.readValue('A')).toBe(5)
        expect(await plcDataService.readValue('C')).toBe(2)
        expect(await plcDataService.readValue('F')).toBe(77)
        expect(await plcDataService.readValue('W')).toBe(9)
        
        await expect(plcDataService.readValue('Z')).rejects.toThrow(new ReferenceError(`value of property Z is not been reached`))        
    })
}) 

describe('ReadValues', () => {
    test('from one PlcDataService using one PLCDataRepository ', async () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1))
        const resoultErrorDummy2 = Object.entries(DUMMY_DATA_2).map((data) => {
            return new ReferenceError(`value of property ${data[0]} is not been reached`)
        })
        const valuesDummy1 = {data : new Map(Object.entries(DUMMY_DATA_1)), error : []}
        const valuesErrorDummy2 : PlcDatasResoult = {data : new Map(), error : resoultErrorDummy2}

        expect(await plcDataService.readValues()).toEqual(valuesDummy1)
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_1))).toEqual(valuesDummy1)
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_2))).toEqual(valuesErrorDummy2)
    })

    test('with connection error from one PlcDataService using one PlcDataRepository', async () => {
        const plcDataService = new PlcDataService(dummyRepositoryConnectionError)
        const valuesErrorDummy : PlcDatasResoult = {data : new Map(), error : [new Error('failed to read values')]}
        expect(await plcDataService.readValues()).toEqual(valuesErrorDummy)
    })

    test('from one PlcDataService using one PlcDataRepository with empty data', async () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository({}))
        const emptyResult : PlcDatasResoult = { data: new Map(), error: [] }

        expect(await plcDataService.readValues()).toEqual(emptyResult)
    })

    test('from one PlcDataService using multiple PlcDataRepository ', async () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1), new DummyPlcDataRepository(DUMMY_DATA_2))
        const valuesDummy1 = Object.entries(DUMMY_DATA_1)
        const valuesDummy2 = Object.entries(DUMMY_DATA_2)
        const valuesResoultDummy1 = {data : new Map(Object.entries(DUMMY_DATA_1)), error : []}
        const valuesResoultDummy2 = {data : new Map(Object.entries(DUMMY_DATA_2)), error : []}
        const valuesMap = new Map([...valuesDummy1, ...valuesDummy2])
        const valuesResoultDummy : PlcDatasResoult= {data: valuesMap, error: []}

        expect(await plcDataService.readValues()).toEqual(valuesResoultDummy)
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_1))).toEqual(valuesResoultDummy1)
        expect(await plcDataService.readValues(Object.keys(DUMMY_DATA_2))).toEqual(valuesResoultDummy2)
    })

    test('with connection error from one PLCDataService using multiple PlcDataRepository',async () => {
        const plcDataService = new PlcDataService(dummyRepositoryConnectionError, new DummyPlcDataRepository(DUMMY_DATA_2))
        const valuesDummy2 = Object.entries(DUMMY_DATA_2)

        const valuesErrorDummy : PlcDatasResoult = {data : new Map(valuesDummy2), error : [new Error('failed to read values')]}
        expect(await plcDataService.readValues()).toEqual(valuesErrorDummy)
    })
})

    // test('of write value', () => {
    //     const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1))
    //     plcDataService.writeValue('A', 20)
    //     .then(res => {
    //         expect(res).toBeUndefined()
    //     })
    //     plcDataService.writeValue('F', 13)
    //     .catch(err => {
    //         expect(err).toEqual(new TypeError('Property value not be write'))
    //     })
    // })

    // test('of write values', () => {
    //     const plcDataService = new PlcDataService(new DummyPlcDataRepository(DUMMY_DATA_1))
    //     plcDataService.writeValues(new Map([['A', 20], ['B', 14], ['D', 1]]))
    //     .then((res) => {
    //         expect(res).toBeUndefined()
    //         })
    //     plcDataService.writeValues(new Map([['A', 20], ['F', 14], ['D', 1]]))
    //     .catch((err) => {
    //         expect(err).toEqual(new TypeError('Property value not be write'))
    //         })
    // })
