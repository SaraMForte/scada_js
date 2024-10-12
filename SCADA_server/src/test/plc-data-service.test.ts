import {describe, expect, test} from '@jest/globals';
import PlcDataService from '../main/application/plc-data-service';
import PlcDataRepository from '../main/application/plc-data-repository';

class DummyPlcDataRepository implements PlcDataRepository {
    static dummyData : {[key : string] : number} = {
        A : 5,
        B : 8,
        C : 2,
        D : 21,
        E : 24
    }

    async readValue(property: string): Promise<number> {
        const value = DummyPlcDataRepository.dummyData[property]
        if(value === undefined) {
            throw new ReferenceError('Property value not be reached')
        }
        return value
    }
    async readValues(): Promise<Map<string, number>> {
        const values = Object.entries(DummyPlcDataRepository.dummyData)
        const valuesMap = new Map(values)

        return valuesMap
    }
    async writeValue(property: string, value: number): Promise<void> {
        if(!(property in DummyPlcDataRepository.dummyData)) {
            throw new TypeError('Property value not be write')
        }
        DummyPlcDataRepository.dummyData[property] = value

        return
    }
    async writeValues(valuesMap: Map<string, number>): Promise<void> {
        for(const property in valuesMap) {
            if (!(property in DummyPlcDataRepository.dummyData)) {
                throw new TypeError('Property value not be write')
            }
        }
        for (const [property, value] of valuesMap) {
            DummyPlcDataRepository.dummyData[property] = value
        }

        return 
    }
    
}

describe('PLC data Service', () => {
    test('of read value', () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository())
        plcDataService.readValue('A')
        .then(res => {
            expect(res).toBe(5)
        })
        plcDataService.readValue('C')
        .then(res => {
            expect(res).toBe(2)
        })
        plcDataService.readValue('F')
        .catch(err => {
            expect(err).toEqual(new ReferenceError('Property value not be reached'))
        })
    })

    test('of read values', () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository())
        plcDataService.readValues()
        .then(res => {
            expect(res).toEqual(new Map(Object.entries(DummyPlcDataRepository.dummyData)))
        })
    })

    test('of write value', () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository())
        plcDataService.writeValue('A', 20)
        .then(res => {
            expect(res).toBeUndefined()
        })
        plcDataService.writeValue('F', 13)
        .catch(err => {
            expect(err).toEqual(new TypeError('Property value not be write'))
        })
    })

    test('of write values', () => {
        const plcDataService = new PlcDataService(new DummyPlcDataRepository())
        plcDataService.writeValues(new Map([['A', 20], ['B', 14], ['D', 1]]))
        .then((res) => {
            expect(res).toBeUndefined()
            })
        plcDataService.writeValues(new Map([['A', 20], ['F', 14], ['D', 1]]))
        .catch((err) => {
            expect(err).toEqual(new TypeError('Property value not be write'))
            })
    })    
})