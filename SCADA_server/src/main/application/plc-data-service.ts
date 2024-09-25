/**
 * La clase implementa la interfaz con el contrato de 'plc-data-repository'
 */
import PlcDataRepository from "./plc-data-repository";

export default class PlcDataService {
    private readonly moduleRepository : PlcDataRepository

    constructor(moduleRepository : PlcDataRepository) {
        this.moduleRepository = moduleRepository
    }

    readValue(property : string) : Promise<number> {
        return this.moduleRepository.readValue(property)
    }
    
    readValues() : Promise<Map<string, number>> {
        return this.moduleRepository.readValues()
    }
    
    writeValue(property : string, value : number) : Promise<void> {
        return this.moduleRepository.writeValue(property, value)
    }
    writeValues(valuesMap : Map<string, number>) : Promise<void> {
        return this.moduleRepository.writeValues(valuesMap)
    }

}