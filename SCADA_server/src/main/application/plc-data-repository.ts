/**
 * Quien implemente esta interfaz establece el contrato de que tiene que 
 * tener la función readData() que devuelva la Promise con un Map y
 * la función writeData() con argumentos key, value.
 */
export default interface PlcDataRepository {
    /**
     * Lee el valor del propiedad dada
     * @param property nombre del valor de la propiedad a leer
     * @returns Una promesa que resuelva con el valor numerico de la propiedad
     * @throws {ReferenceError} Cuando el valor de la propiedad no ha sido encotnrado
     */
    readValue(property : string) : Promise<number>
    
    /**
     * Lee los valores de las propiedades dadas en el Mapa
     * @returns Una promesa que resuelva con un mapa de propiedades y sus valores respectivos
     * @throws {ReferenceError} Cuando los valores no se han podido recuperar
     */
    readValues() : Promise<Map<string, number>>

    /**
     * Escribe el valor de la propiedad en el PLC
     * @param property El nombre del valor de la propiedad a escribir en el PLC
     * @param value EL valor que se va escribir en la propiedad del PLC
     * @returns Una promesa que resuelve cuando la operacion esta completa
     * @throws {TypeError} Cuando el valor no se ha podido escribir en el PLC
     */
    writeValue(property : string, value : number) : Promise<void> 

    /**
     * Escribe los valores de las propiedades del mapa en el PLC
     * @param valuesMap Un mapa propiedad y valor a la que acceder y escribir en el PLC
     * @returns Una promesa que resuelve cuando la operacion esta completa
     * @throws {TypeError} Cuando uno o más valores no se pueden escribir en el PLC
     */
    writeValues(valuesMap : Map<string, number>) : Promise<void>
}