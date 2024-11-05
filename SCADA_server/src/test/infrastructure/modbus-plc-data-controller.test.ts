import { describe, expect, test } from 'vitest'
import { mapErrorToResponseError } from '../../main/infrastructure/modbus-plc-data-controller'
import { PropertyError } from '../../main/application/errors'
import PlcDataService from '../../main/application/plc-data-service'
import runServer from '../../main/infrastructure/run-server'
import sinon from 'sinon'
import supertest from 'supertest'

const service = sinon.createStubInstance(PlcDataService)
const supertestRun = supertest(runServer(service))

describe('Controller Modbus ReadValue', () => {
    test('GIVEN modbus service WHEN reading property value from modbus THEN return json with data', async () => {
        service.readValue.resolves(25)

        const response = await supertestRun.get('/modbus-read-value').query({ property: 'A' })

        expect(response.body).toEqual({ A: 25 })
        expect(response.status).toBe(200)
        service.readValue.reset()
    })

    test('GIVEN modbus service WHEN service read fail THEN return error', async () => {
        const errorTest = new Error('Service fail read')
        service.readValue.rejects(errorTest)

        const response = await supertestRun.get('/modbus-read-value').query({ property: 'A' })

        expect(response.body).toEqual(mapErrorToResponseError(errorTest))
        expect(response.status).toBe(400)
        service.readValue.reset()
    })

    test('GIVEN modbus service WHEN reading no valid property THEN return error', async () => {
        const propertyName = undefined
        const errorTest = new PropertyError(`${propertyName}`, `Property ${propertyName} is a Invalid parameter`)
        const response = await supertestRun.get('/modbus-read-value')

        expect(response.status).toBe(400)
        expect(response.body).toEqual(mapErrorToResponseError(errorTest))
        service.readValue.reset()
    })
})

describe('Controller Modbus ReadValues', () => {
    test('GIVEN modbus service WHEN read values without properties parameters THEN json return with data', async () => {
        const readValuesResult = {
            data: new Map([
                ['A', 11],
                ['B', 22]
            ]),
            error: []
        }
        service.readValues.resolves(readValuesResult)

        const response = await supertestRun.get('/modbus-read-values')

        expect(response.status).toBe(200)
        expect(response.body).toEqual(Object.fromEntries(readValuesResult.data))
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN read vales with properties parameters THEN return json with data', async () => {
        const readValuesResult = {
            data: new Map([
                ['C', 33],
                ['D', 44]
            ]),
            error: []
        }
        service.readValues.resolves(readValuesResult)

        const response = await supertestRun.get('/modbus-read-values').query({ properties: 'C,D' })

        expect(response.status).toBe(200)
        expect(response.body).toEqual(Object.fromEntries(readValuesResult.data))
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN errors to read values with modbus THEN json with data', async () => {
        const readValuesResult = { data: new Map(), error: [new Error('TestError'), new Error('TestError')] }
        service.readValues.resolves(readValuesResult)

        const response = await supertestRun.get('/modbus-read-values')

        const expectError = readValuesResult.error.map(error => mapErrorToResponseError(error))

        expect(response.body).toEqual(expectError)
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN read data with modbus THEN json with data and errors', async () => {
        const readValuesResult = {
            data: new Map([
                ['A', 11],
                ['B', 22]
            ]),
            error: [new Error('TestError'), new Error('TestError')]
        }

        service.readValues.resolves(readValuesResult)

        const response = await supertestRun.get('/modbus-read-values')

        const expectErrorArray = readValuesResult.error.map(error => mapErrorToResponseError(error))
        const expectData = Object.fromEntries(readValuesResult.data)
        const expectResponseBody = {
            result: {
                200: expectData,
                500: expectErrorArray
            }
        }

        expect(response.body).toEqual(expectResponseBody)
        service.readValues.reset()
    })
})

describe('Controller Modbus WriteValue', async () => {
    test('GIVEN modbus service WHEN send invalid request body THEN return error', async () => {
        const response = await supertestRun.put('/modbus-write-value').send({
            key: 11,
            value: 'A'
        })
        expect(response.status).toBe(500)
        expect(response.body).toEqual(mapErrorToResponseError(new Error('Invalid request body')))
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN send non-existent key in plc THEN return error', async () => {
        const response = await supertestRun.put('/modbus-write-value').send({
            key: 'Z',
            value: 99
        })
        expect(response.status).toBe(500)
        expect(response.body).toEqual(mapErrorToResponseError(new Error('Property Z not found in Plc')))
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN writing data with modbus THEN data update corretly', async () => {
        service.writeValue.resolves()

        const response = await supertestRun.put('/modbus-write-value').send({
            key: 'A',
            value: 11
        })
        expect(response.status).toBe(204)
        service.readValues.reset()
    })

    test('GIVEN modbus service WHEN attempt writing error THEN return error', async () => {
        const testError = new PropertyError('testError', 'Testing Errors', new Error('Cause Testing Error'))
        service.writeValue.rejects(testError)

        const response = await supertestRun.put('/modbus-write-value').send({
            key: 'A',
            value: 11
        })
        expect(response.status).toBe(500)
        expect(response.body).toEqual(mapErrorToResponseError(testError))
        service.readValue.reset()
    })
})

describe('Controller Modbus WriteValues', () => {
    test('GIVEN modbus service WHEN writing data with modbus THEN data update correctly', async () => {
        service.writeValues.resolves([])

        const response = await supertestRun.put('/modbus-write-values').send({
            A: 11,
            B: 22
        })
        expect(response.status).toBe(204)
        service.writeValues.reset()
    })

    test('GIVEN modbus service WHEN error service attempting write THEN return errors', async () => {
        const testError = new PropertyError('testError', 'Testing Errors', new Error('Cause Testing Error'))
        service.writeValues.rejects(testError)

        const response = await supertestRun.put('/modbus-write-values').send({
            A: 11,
            B: 22
        })
        expect(response.status).toBe(400)
        service.writeValues.reset()
    })

    test('GIVEN modbus service WHEN write data with errors THEN return errors', async () => {
        const testError = new PropertyError('testErrorXY', 'Testing Errors', new Error('Cause Testing Error'))
        service.writeValues.resolves([testError, testError])

        const response = await supertestRun.put('/modbus-write-values').send({
            A: 11,
            B: 22
        })
        expect(response.status).toBe(207)
        expect(response.body).toEqual([mapErrorToResponseError(testError), mapErrorToResponseError(testError)])
        service.writeValues.reset()
    })

    test('GIVEN modbus service WHEN endpoint non-existing property THEN return error', async () => {
        const response = await supertestRun.put('/modbus-write-values').send({
            Z: 11
        })

        const expectError = new Error(`The key Z does not exist in the PLC`)
        expect(response.status).toBe(400)
        expect(response.body).toEqual(mapErrorToResponseError(expectError))
    })

    test('GIVEN modbus service WHEN endpoint recive property value not number THEN return error', async () => {
        const response = await supertestRun.put('/modbus-write-values').send({
            A: '11'
        })

        const expectError = new Error(`The value 11 for key A isnt of type number`)
        expect(response.status).toBe(400)
        expect(response.body).toEqual(mapErrorToResponseError(expectError))
    })
})
