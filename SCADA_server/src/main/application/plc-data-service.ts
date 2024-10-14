/**
 * La clase implementa la interfaz con el contrato de 'plc-data-repository'
 */
import PlcDataRepository from "./plc-data-repository";

export type PlcDatasResoult = {
    data : Map<string, number>,
    error : Error[]
}

export default class PlcDataService {
    private readonly repositories : PlcDataRepository[]

    constructor(...repositories : PlcDataRepository[]) {
        this.repositories = repositories
    }

    async readValue(property : string) : Promise<number> {
        const repositoriesPromises = this.repositories
            .map(repository => repository.readValue(property)
                .catch<Error>(err => err))
            
        const dataOrErrorArray = await Promise.all(repositoriesPromises)
        for(const dataOrError of dataOrErrorArray) {
            if(!(dataOrError instanceof Error)) {
                return dataOrError
            }
        }
        throw new Error(`value of property ${property} is not been reached`)
    }
    
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
        const repositoriesPromises : Promise<Map<string, number > | Error>[] = this.repositories
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

    writeValue(property : string, value : number) : Promise<void> {
        return this.repositories[0].writeValue(property, value)
    }

    writeValues(valuesMap : Map<string, number>) : Promise<void> {
        return this.repositories[0].writeValues(valuesMap)
    }

}

