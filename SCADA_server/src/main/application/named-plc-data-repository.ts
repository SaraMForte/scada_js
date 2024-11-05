import PlcDataRepository from './plc-data-repository'

/**
 * Esta interfaz extiende de la interfaz PlcDataRepository añadiendo un
 * nombre de plc al que consultar los datos
 */
export default interface NamedPlcDataRepository extends PlcDataRepository {
    plcName: string
}
