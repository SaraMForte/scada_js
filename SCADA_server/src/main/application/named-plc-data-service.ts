import { PropertyError, PropertyNotFoundError, PropertyWriteError, RepositoryNotFoundError } from "./errors";
import NamedPlcDataRepository from "./named-plc-data-repository";

export type PlcDatasResoult = {
    data : Map<string, number>,
    error : Error[]
}

export default class NamedPlcDataService {
    readonly #repositories : Map<string, NamedPlcDataRepository>

    constructor(...repositories : NamedPlcDataRepository[]) {
        const repositoriesMap : [string, NamedPlcDataRepository][] = repositories.map(repository => {
            return [repository.plcName, repository]
        })
        this.#repositories = new Map(repositoriesMap)
    }

    get getPlcNames() : string[] {
        return [...this.#repositories.keys()]
    }

    /**
     * Devuelve el valor de la propiedad especificada de un PLC
     * @param plcName El nombre del PLC en el que se desea buscar
     * @param property El nombre de la propiedad que se desea buscar
     * @returns Una promesa de un numero que devuelve el valor de la propiedad encontrada
     * @throws {RepositoryNotFoundError} Cuando el repositorio no existe o no se encuentra
     */
    async readValue(plcName : string, property: string): Promise<number> {
        const repositoryProperty = this.#repositories.get(plcName)
        if(!repositoryProperty) {
            throw new RepositoryNotFoundError(plcName)
        } 
        return await repositoryProperty.readValue(property)
    }

    /**
     * Devuelve un mapa de los valores y propiedad junto a una lista de errores
     * @param plcName El nombre del PLC en el que se desea buscar
     * @param properties Lista de nombres de propiedades a buscar
     * @returns Una promesa de un objeto que se resuelve con una lista de datos y otra lista de errores
     * @throws {RepositoryNotFoundError} Cuando el repositorio no existe o no se encuentra
     */
    async readValues(plcName : string, properties? : string[]): Promise<PlcDatasResoult> {
        const repositoryProperties = this.#repositories.get(plcName)
        if(!repositoryProperties) {
            throw new RepositoryNotFoundError(plcName)
        }
        if(properties) {
            return this.readValuesWithProperties(repositoryProperties, properties)
        }
        return this.readValuesWithoutProperties(repositoryProperties)
    }
    
    async readValuesWithoutProperties(repository : NamedPlcDataRepository) : Promise<PlcDatasResoult> {
        const readValues = await repository.readValues()
            .catch(cause => cause)
        if(readValues instanceof Error) {
            return {data : new Map(), error : [readValues]}
        }
        return {data : readValues, error : []}
    }

    async readValuesWithProperties(repository : NamedPlcDataRepository, properties : string[]) : Promise<PlcDatasResoult> {
        const dataMap : Map<string, number> = new Map()
        const errorArray : Error[] = []

        const promisesData = properties.map(property => {
            repository.readValue(property)
                .then(data => dataMap.set(property, data))
                .catch(cause => errorArray.push(new PropertyNotFoundError(property, cause)))
        })
        await Promise.all(promisesData)
        return {data : dataMap, error : errorArray}
    }

    /**
     * Actualiza el valor de una propiedad especificada del repositorio
     * @param plcName El nombre del PLC que se desea actualizar
     * @param property La propiedad que se desea actualizar
     * @param value El valor al que se actualizara la propiedad
     * @throws {RepositoryNotFoundError} Cuando el repositorio no existe o no se encuentra
     * @throws {PropertyWriteError} Cuando una propiedad no se ha podido escribir correctamente en el repositorio
     */
    async writeValue(plcName : string, property: string, value: number): Promise<void> {
        const repositoryProperties = this.#repositories.get(plcName)
        if(!repositoryProperties) {
            throw new RepositoryNotFoundError(plcName)
        }
        await repositoryProperties.writeValue(property, value)
            .catch(cause => {throw new PropertyWriteError(property, value, cause)})
    }
    
    /**
     * Actualiza los valores de las propiedades especificadas del repositorio
     * @param plcName El nombre del PLC que se desea actualizar
     * @param valuesMap Un mapa que asocia nombres de propiedades con su valor 
     * @returns Una promesa que se resuelve con una lista de errores producidos al actualizar el valor
     * @throws {RepositoryNotFoundError} Cuando el repositorio no existe o no se encuentra
     */
    async writeValues(plcName : string, valuesMap: Map<string, number>): Promise<PropertyError[]> {
        const repositoryProperties = this.#repositories.get(plcName)
        if(!repositoryProperties) {
            throw new RepositoryNotFoundError(plcName)
        }

        const internalWriteValue = async ([property, value] : [string, number]) : Promise<PropertyError | void> => {
            return await repositoryProperties.writeValue(property, value)
                .catch(cause => cause)
        }
        const writePromises = Array.from(valuesMap).map(internalWriteValue)
        const writeResults = await Promise.all(writePromises)

        return writeResults.filter(result => typeof result !== 'undefined')
    }
}