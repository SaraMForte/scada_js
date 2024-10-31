/**
 * Quien implemente esta interfaz establece el contrato de que tiene que
 * tener la función readData() que devuelva la Promise con un Map y
 * la función writeData() con argumentos key, value.
 */
export default interface PlcDataRepository {
    /**
     * Lee el valor del propiedad dada
     * @param {string} property nombre del valor de la propiedad a leer
     * @returns {Promise<number>} Una promesa que resuelva con el valor numerico de la propiedad
     * @throws {PropertyNotFoundError} Cuando la propiedad no ha sido encontrada
     * @throws {unknown} cuando ocurre un error desconocido al conectar o leer los registros
     */
    readValue(property: string): Promise<number>

    /**
     * Lee los valores de las propiedades dadas en el Mapa
     * @returns {Promise<Map<string, number>>} Una promesa que resuelva con un mapa de propiedades y
     * sus valores respectivos
     * @throws {unknown} cuando ocurre un error desconocido al conectar o leer los registros
     */
    readValues(): Promise<Map<string, number>>

    /**
     * Escribe el valor de la propiedad en el PLC
     * @param {string} property El nombre del valor de la propiedad a escribir en el PLC
     * @param {number} value EL valor que se va escribir en la propiedad del PLC
     * @returns {Promise<void>} Una promesa que resuelve cuando la operacion esta completa
     * @throws {PropertyWriteError} Cuando el valor no se ha podido escribir en el PLC
     * @throws {unknown} cuando ocurre un error desconocido al conectar o escribir los registros
     */
    writeValue(property: string, value: number): Promise<void>

    /**
     * Escribe los valores de las propiedades del mapa en el PLC
     * @param {Map<string, number>} valuesMap Un mapa propiedad y valor a la que acceder y escribir en el PLC
     * @returns {Promise<void>} Una promesa que resuelve cuando la operacion esta completa
     * @throws {PropertyWriteError} Cuando uno o más valores no se pueden escribir en el PLC
     * @throws {unknown} cuando ocurre un error desconocido al conectar o escribir los registros
     */
    writeValues(valuesMap: Map<string, number>): Promise<void>
}
