/**
 * La clase implementa la interfaz con el contrato de 'plc-data-repository'
 */
import { PropertyError, PropertyNotFoundError, PropertyWriteError, RepeatedPropertyError } from './errors'
import PlcDataRepository from './plc-data-repository'

export type PlcDatasResoult = {
    data: Map<string, number>
    error: Error[]
}

type PropertiesByRepositoryGroupingResult = {
    groups: PropertiesByRepository
    errors: PropertyError[]
}

type PropertiesByRepository = Map<PlcDataRepository, Map<string, number>>

export default class PlcDataService {
    readonly #repositories: PlcDataRepository[]

    constructor(...repositories: PlcDataRepository[]) {
        this.#repositories = repositories
    }

    /**
     * Busca y devuelve el valor de la propiedad especificada como argumento
     * @param property El nombre de la propiedad que se desea buscar
     * @returns Una promesa que se resuelve con el valor de la propiedad encontrada
     * @throws {PropertyNotFoundError} Cuando no se ha podido encontrar la propiedad
     * @throws {RepeatedPropertyError} Cuando se encuentran multiples propiedades repetidas en distintos repositorios
     */
    async readValue(property: string): Promise<number> {
        const dataOrErrorArray = await this.#getRepositoriesPromisesOfRead(property)
        const validData = await this.#filterValidValues(dataOrErrorArray)
        return this.#resolvePropertyValue(property, validData)
    }

    #resolvePropertyValue(property: string, validDataArray: number[]) {
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
     * Comprueba si una propiedad existe y no está en multiples dispositivos antes de escribir un nuevo valor
     * @param property Nombre de la propiedad que se desea escribir
     * @param {number}value Valor que se desea asignar a la propiedad
     * @returns {Promise<void>} Una promesa vacia que se resuelve cuando la operación de escritura se completa
     * @throws {PropertyWriteError} Cuando ocurre un error durante el proceso de escritura
     * @throws {PropertyNotFoundError} Cuando no se ha podido encontrar la propiedad
     * @throws {RepeatedPropertyError} Cuando se encuentran multiples propiedades repetidas en distintos repositorios
     */
    async writeValue(property: string, value: number): Promise<void> {
        const propertyRepository = await this.#findPropertyRepository(property)
        return propertyRepository.writeValue(property, value).catch(cause => {
            throw new PropertyWriteError(property, value, cause)
        })
    }

    /**
     * Comprueba si las propiedades existen y no se encuentran en multiples dispositivos
     * antes de intentar escribir en ellos
     * @param {Map<string, number>} valuesMap Un mapa que asocia nombres de propiedades con su valor
     * @returns {Promise<PropertyError[]>} Una promesa que se resuelve con una lista de errores del tipo PropertyError
     * @throws {unknown} Cuando se produce un error desconocido
     */
    async writeValues(valuesMap: Map<string, number>): Promise<PropertyError[]> {
        const propertiesByRepositoryGroup = await this.#groupPropertiesByRepository(valuesMap)
        const propertiesWriteErrors = await this.#writeProperiesGroups(propertiesByRepositoryGroup.groups)

        return [...propertiesByRepositoryGroup.errors, ...propertiesWriteErrors]
    }

    async #groupPropertiesByRepository(valuesMap: Map<string, number>): Promise<PropertiesByRepositoryGroupingResult> {
        const propertiesByRepository: PropertiesByRepository = new Map()
        const propertiesErrors: PropertyError[] = []
        await Promise.all(
            Array.from(valuesMap).map(this.#addToRepositoryGroup(propertiesByRepository, propertiesErrors))
        )
        return { groups: propertiesByRepository, errors: propertiesErrors }
    }

    #addToRepositoryGroup(propertiesByRepository: PropertiesByRepository, propertiesErrors: PropertyError[]) {
        return async ([property, value]: [string, number]) => {
            try {
                const repository = await this.#findPropertyRepository(property)
                if (!propertiesByRepository.has(repository)) {
                    propertiesByRepository.set(repository, new Map())
                }
                propertiesByRepository.get(repository)!.set(property, value)
            } catch (error) {
                if (error instanceof PropertyError) {
                    propertiesErrors.push(error)
                } else {
                    throw error
                }
            }
        }
    }

    /**
     * Comprueba si una propiedad existe y devuelve la posición en la lista de repositorios
     * @param {string} property El nombre de la propiedad que se desea comprobar
     * @returns {Promise<PlcDataRepository>} Una promesa de un numero que se resuelve cuando se encuentra la posicion
     * de la propiedad
     * @throws {PropertyNotFoundError} Cuando no se ha podido encontrar la propiedad
     * @throws {RepeatedPropertyError} Cuando se encuentran multiples propiedades repetidas en distintos repositorios
     * @throws {unknown} Cuando se produce un error desconocido
     */
    async #findPropertyRepository(property: string): Promise<PlcDataRepository> {
        const dataOrErrorArray = await this.#getRepositoriesPromisesOfRead(property)
        const validDataArray = await this.#filterValidValues(dataOrErrorArray)
        const repositoryIndex = await this.#resolvePropertyExist(property, validDataArray, dataOrErrorArray)
        return this.#repositories[repositoryIndex]
    }

    async #getRepositoriesPromisesOfRead(property: string) {
        const repositoriesPromises = this.#repositories.map(repository =>
            repository.readValue(property).catch<Error>(err => err)
        )
        return await Promise.all(repositoriesPromises)
    }

    async #filterValidValues(dataOrErrorArray: Array<number | Error>) {
        return dataOrErrorArray.filter(dataOrError => this.#isValidData(dataOrError))
    }

    #isValidData(dataOrError: number | Error): dataOrError is number {
        return !(dataOrError instanceof Error)
    }

    async #resolvePropertyExist(
        property: string,
        validDataArray: number[],
        dataOrErrorArray: Array<number | Error>
    ): Promise<number> {
        switch (validDataArray.length) {
            case 0:
                throw this.#buildError(property, dataOrErrorArray[0])
            case 1:
                return await this.#getPropertyPosition(dataOrErrorArray)
            default:
                throw new RepeatedPropertyError(property, validDataArray.length)
        }
    }

    #buildError(property: string, dataOrError: number | Error) {
        if (dataOrError instanceof PropertyError) {
            return new PropertyNotFoundError(property)
        }
        return dataOrError
    }

    async #getPropertyPosition(dataOrErrorArray: Array<number | Error>): Promise<number> {
        return dataOrErrorArray.findIndex(dataOrError => !(dataOrError instanceof Error))
    }

    async #writeProperiesGroups(propertiesByRepository: PropertiesByRepository): Promise<PropertyError[]> {
        const propertyErrorArrays = await Promise.all(
            Array.from(propertiesByRepository).map(PlcDataService.#writeToRepository)
        )
        return propertyErrorArrays.filter(value => typeof value !== 'undefined').flat()
    }

    static async #writeToRepository([repository, valuesMap]: [PlcDataRepository, Map<string, number>]): Promise<
        void | PropertyError[]
    > {
        try {
            repository.writeValues(valuesMap)
        } catch (cause) {
            return Array.from(valuesMap).map(([property, value]) => new PropertyWriteError(property, value, cause))
        }
    }

    /**
     * Busca y devuelve los valores de las propiedades espeficicadas como argumento. En caso de no ser especicadas,
     * se devolveran los valores o errores de todas las propiedades encontradas
     * @param propiertiesArray Lista de nombres de propiedades a buscar. Si no se proporciona, se buscan todas.
     * @returns Una promesa de un objeto que se resuelve con una lista de datos y otra lista de errores
     */
    readValues(propiertiesArray?: string[]): Promise<PlcDatasResoult> {
        if (propiertiesArray) {
            return this.#readValuesWithPropierties(propiertiesArray)
        }
        return this.#readValuesWithoutPropierties()
    }

    async #readValuesWithPropierties(propiertiesArray: string[]): Promise<PlcDatasResoult> {
        const propiertiesPromise = propiertiesArray.map(property => this.readValue(property).catch<Error>(err => err))

        const dataOrError = await Promise.all(propiertiesPromise)

        const dataMap: Map<string, number> = new Map()
        const errorArray: Error[] = []
        for (let i = 0; i < propiertiesArray.length; i++) {
            const currentDataOrError = dataOrError[i]
            if (currentDataOrError instanceof Error) {
                errorArray.push(currentDataOrError)
            } else {
                dataMap.set(propiertiesArray[i], currentDataOrError)
            }
        }

        return { data: dataMap, error: errorArray }
    }

    async #readValuesWithoutPropierties(): Promise<PlcDatasResoult> {
        const repositoriesPromises: Promise<Map<string, number> | Error>[] = this.#repositories.map(repository =>
            repository.readValues().catch(err => err)
        )

        const dataOrErrorArray = await Promise.all(repositoriesPromises)
        const errorArray: Error[] = []
        const dataArray: Map<string, number>[] = []
        for (const dataOrError of dataOrErrorArray) {
            if (dataOrError instanceof Error) {
                errorArray.push(dataOrError)
            } else {
                dataArray.push(dataOrError)
            }
        }
        const dataMap: Map<string, number> = dataArray.reduce((oldMap, currentMap) => {
            return new Map([...oldMap, ...currentMap])
        }, new Map())

        return { data: dataMap, error: errorArray }
    }
}
