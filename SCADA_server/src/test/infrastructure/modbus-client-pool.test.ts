import { describe, expect, test } from 'vitest'
import { StandloneModbusClient } from '../../main/infrastructure/standlone-modbus-client'
import { StandloneModbusClientPool } from '../../main/infrastructure/modbus-client-pool'
import sinon from 'sinon'

describe.only('', () => {
    test('GIVEN standlone modbus client WHEN create new pool with invalid size THEN throw error', () => {
        const mockClient = sinon.createStubInstance(StandloneModbusClient)
        expect(() => new StandloneModbusClientPool(() => mockClient, 0)).toThrow(Error)
    })

    test('GIVEN pool WHEN get element of pool THEN return element of pool', async () => {
        const mockClient = sinon.createStubInstance(StandloneModbusClient)
        const mockPool = new StandloneModbusClientPool(() => mockClient, 2)

        const client1 = await mockPool.get()
        const client2 = await mockPool.get()

        expect(client1).toBeDefined()
        expect(client2).toBeDefined()
        expect(client1).not.toBe(client2)
    })

    test('GIVEN pool with elements WHEN requesting while pool full THEN return promise that resolve when available', async () => {
        const mockClient = sinon.createStubInstance(StandloneModbusClient)
        const mockPool = new StandloneModbusClientPool(() => mockClient, 1)

        const client1 = await mockPool.get()
        const client2Promise = mockPool.get()

        expect(client2Promise).toBeInstanceOf(Promise)

        client1.end()

        const client2 = await client2Promise
        expect(client2).toEqual(client1)
        expect(client2).not.toBeInstanceOf(Promise)
    })
})
