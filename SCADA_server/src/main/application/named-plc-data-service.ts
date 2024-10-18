import NamedPlcDataRepository from "./named-plc-data-repository";

export type PlcDatasResoult = {
    data : Map<string, number>,
    error : Error[]
}

export default class NamedPlcDataService {
    readonly #repositories : NamedPlcDataRepository[]

    constructor(...repositories : NamedPlcDataRepository[]) {
        this.#repositories = repositories
    }

    readValue(property: string): Promise<number> {
        throw new Error("Method not implemented.");
    }
    readValues(): Promise<Map<string, number>> {
        throw new Error("Method not implemented.");
    }
    writeValue(property: string, value: number): Promise<void> {
        throw new Error("Method not implemented.");
    }
    writeValues(valuesMap: Map<string, number>): Promise<void> {
        throw new Error("Method not implemented.");
    }

}