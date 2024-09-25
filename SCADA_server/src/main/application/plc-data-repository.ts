/**
 * Quien implemente esta interfaz establece el contrato de que tiene que 
 * tener la función readData() que devuelva la Promise con un Map y
 * la función writeData() con argumentos key, value.
 */
export default interface PlcDataRepository {
    readValue(property : string) : Promise<number>
    readValues() : Promise<Map<string, number>>
    writeValue(property : string, value : number) : Promise<void> 
    writeValues(valuesMap : Map<string, number>) : Promise<void>
}