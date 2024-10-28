/**
 * La clase implementa la interfaz con el contrato de 'plc-data-repository'
 */
import { PropertyError, PropertyNotFoundError, PropertyWriteError, RepeatedPropertyError } from "./errors";
import PlcDataRepository from "./plc-data-repository";

export type PlcDatasResoult = {
    data : Map<string, number>,
    error : Error[]
}

export default class PlcDataService {
    readonly #repositories : PlcDataRepository[]


    constructor(...repositories : PlcDataRepository[]) {
        this.#repositories = repositories
    }

    /**
     * Busca y devuelve el valor de la propiedad especificada como argumento
     * @param property El nombre de la propiedad que se desea buscar
     * @returns Una promesa que se resuelve con el valor de la propiedad encontrada
     * @throws {PropertyNotFoundError} Cuando no se ha podido encontrar la propiedad
     * @throws {RepeatedPropertyError} Cuando se encuentran multiples propiedades repetidas en distintos repositorios
     */
    async readValue(property : string) : Promise<number> {
        const dataOrErrorArray = await this.#getRepositoriesPromisesOfRead(property)
        const validData = await this.#filterValidValues(dataOrErrorArray)
        return this.#resolvePropertyValue(property, validData)
    }

    async #getRepositoriesPromisesOfRead (property : string) {
        const repositoriesPromises = this.#repositories
            .map(repository => repository.readValue(property)
                .catch<Error>(err => err))
        return await Promise.all(repositoriesPromises)
    }

    async #filterValidValues (dataOrErrorArray : Array<number | Error>) {
        return dataOrErrorArray.filter((dataOrError) => this.#isValidData(dataOrError))
    }

    #isValidData(dataOrError : number | Error): dataOrError is number {
        return !(dataOrError instanceof Error)
    }

    #resolvePropertyValue (property : string, validDataArray : number[]) {
        switch (validDataArray.length) {
            case 0: 
                throw new PropertyNotFoundError(property)
            case 1:
                return validDataArray[0]
            default:
                throw new RepeatedPropertyError(property, validDataArray.length)
        }
    }
    
    /**
     * Busca y devuelve los valores de las propiedades espeficicadas como argumento. En caso de no ser especicadas, 
     * se devolveran los valores o errores de todas las propiedades encontradas
     * @param propiertiesArray Lista de nombres de propiedades a buscar. Si no se proporciona, se buscan todas.
     * @returns Una promesa de un objeto que se resuelve con una lista de datos y otra lista de errores
     */
    readValues(propiertiesArray? : string[]) : Promise<PlcDatasResoult> {
        if(propiertiesArray) {
            return this.#readValuesWithPropierties(propiertiesArray)
        }
        return this.#readValuesWithoutPropierties()
    }

    async #readValuesWithPropierties(propiertiesArray : string[]) : Promise<PlcDatasResoult> {
        const propiertiesPromise = propiertiesArray
        .map(property => this.readValue(property)
            .catch<Error>(err => err))

        const dataOrError = await Promise.all(propiertiesPromise)

        const dataMap : Map<string, number> = new Map()
        let errorArray : Error[] = []
        for(let i = 0; i < propiertiesArray.length; i++) {
            const currentDataOrError = dataOrError[i]
            if (currentDataOrError instanceof Error) {
                errorArray.push(currentDataOrError)
            } else {
                dataMap.set(propiertiesArray[i], currentDataOrError)
            }
        }
        
        return {data : dataMap, error : errorArray}
    }

    async #readValuesWithoutPropierties() : Promise<PlcDatasResoult> {
        const repositoriesPromises : Promise<Map<string, number > | Error>[] = this.#repositories
        .map(repository => repository.readValues()
            .catch(err => err))
        
        const dataOrErrorArray = await Promise.all(repositoriesPromises)
        let errorArray : Error[] = []
        let dataArray : Map<string, number >[] = [] 
        for(const dataOrError of dataOrErrorArray) {
            if (dataOrError instanceof Error) {
                errorArray.push(dataOrError)
            } else {
                dataArray.push(dataOrError)
            }
        }
        const dataMap : Map<string, number> = dataArray.reduce((oldMap, currentMap) => {
            return new Map([...oldMap, ...currentMap])
            }, new Map())

        return {data : dataMap, error : errorArray}
    }

    /**
     * Comprueba si una propiedad existe y no está en multiples dispositivos antes de escribir un nuevo valor
     * @param property Nombre de la propiedad que se desea escribir
     * @param value Valor que se desea asignar a la propiedad
     * @returns Una promesa vacia que se resuelve cuando la operación de escritura se completa
     * @throws {PropertyWriteError} Cuando ocurre un error durante el proceso de escritura
     * @throws {PropertyNotFoundError}
     * @throws {RepeatedPropertyError}
     */
    async writeValue(property : string, value : number) : Promise<void> {
        const propertyRepository = await this.#findPropertyRepository(property)
        return propertyRepository.writeValue(property, value)
            .catch(cause => {
                throw new PropertyWriteError(property, value, cause)
            })
    }

    /**
     * Comprueba si una propiedad existe y devuelve la posición en la lista de repositorios
     * @param property El nombre de la propiedad que se desea comprobar
     * @returns Una promesa de un numero que se resuelve cuando se encuentra la posicion de la propiedad
     * @throws {PropertyNotFoundError} Cuando no se ha podido encontrar la propiedad
     * @throws {RepeatedPropertyError} Cuando se encuentran multiples propiedades repetidas en distintos repositorios
     */
    async #findPropertyRepository(property : string) : Promise<PlcDataRepository> {
        const dataOrErrorArray = await this.#getRepositoriesPromisesOfRead(property)
        const validDataArray = await this.#filterValidValues(dataOrErrorArray)
        const repositoryIndex = await this.#resolvePropertyExist(property, validDataArray, dataOrErrorArray)
        return this.#repositories[repositoryIndex]
    }
    
    async #resolvePropertyExist (property : string, validDataArray : number[], dataOrErrorArray : Array<number | Error>) : Promise<number> {
        switch (validDataArray.length) {
            case 0: 
                throw new PropertyNotFoundError(property)
            case 1:
                return await this.#getPropertyPosition(dataOrErrorArray)
            default:
                throw new RepeatedPropertyError(property, validDataArray.length)
        }
    }

    buildMotiveError() {

    }

    async #getPropertyPosition(dataOrErrorArray : Array<number | Error>) : Promise<number> {
        return dataOrErrorArray.findIndex(dataOrError => !(dataOrError instanceof Error))
    }

    /**
     * Comprueba si las propiedades existen y no se encuentran en multiples dispositivos 
     * antes de intentar escribir en ellos
     * @param valuesMap Un mapa que asocia nombres de propiedades con su valor
     * @returns Una promesa que se resuelve con una lista de errores del tipo PropertyError
     */
    async writeValues(valuesMap : Map<string, number>) : Promise<PropertyError[]> {
        const internalWriteValue = async ([property, value] : [string, number]) : Promise<PropertyError | void> => {
            return await this.writeValue(property, value)
                .catch(cause => cause)
        }
        const writePromises = Array.from(valuesMap).map(internalWriteValue)
        const writeResults = await Promise.all(writePromises)
        return writeResults.filter(result => typeof result !== 'undefined')
    }

    async writeValues2(valuesMap : Map<string, number>) : Promise<PropertyError[]> {
        const IndexPropertyMap = new Map()
        const promises = Array.from(valuesMap.entries()).map(async ([key, value]) => {
            const result = await this.#findPropertyRepository(key)
            return [key, result]
        })
        const results = await Promise.all(promises)
        results.forEach(([key, result]) => {
            IndexPropertyMap.set(key, result)
        })
        console.log(IndexPropertyMap)
        return []
    }
}
    