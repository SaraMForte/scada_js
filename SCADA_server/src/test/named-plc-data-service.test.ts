import { describe, expect, test } from "@jest/globals"

import NamedPlcDataRepository from "../main/application/named-plc-data-repository"
import NamedPlcDataService from "../main/application/named-plc-data-service"

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

const dummyRepository : NamedPlcDataRepository = {
    plcName: "",
    readValue: function (property: string): Promise<number> {
        throw new Error("Function not implemented.")
    },
    readValues: function (): Promise<Map<string, number>> {
        throw new Error("Function not implemented.")
    },
    writeValue: function (property: string, value: number): Promise<void> {
        throw new Error("Function not implemented.")
    },
    writeValues: function (valuesMap: Map<string, number>): Promise<void> {
        throw new Error("Function not implemented.")
    }
}

const dummyRepositoryConnectionError: NamedPlcDataRepository = {
    plcName: "",
    readValue: jest.fn().mockResolvedValue(new ReferenceError('failed to read value')),
    readValues: jest.fn().mockResolvedValue(new ReferenceError('failed to read values')),
    writeValue: jest.fn().mockRejectedValue(new Error('Function not implemented.')),
    writeValues: jest.fn().mockRejectedValue(new Error('Function not implemented.')),
}

describe('Creation', () => {
    test('from NamedPlcDataService with one NamedPlcDataRepository', async () => {
        
    })
})