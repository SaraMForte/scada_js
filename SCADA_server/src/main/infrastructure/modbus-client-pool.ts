import { StandloneModbusClient } from "./standlone-modbus-client"

export class StandloneModbusClientPool {
    #freeElements: StandloneModbusClient[]
    #requestQueue: ((val: StandloneModbusClient) => void)[]

    constructor(generator: () => StandloneModbusClient, poolSize: number) {
        if (poolSize < 1) {
            throw new RangeError(`Expected pool size will be at least 1, given ${poolSize}`)
        }
        const handler = new StandloneModbusClientPool.#RefundAtEndHandler(this)
        this.#freeElements = Array.from({ length: poolSize }, () => new Proxy(generator(), handler))
        this.#requestQueue = []
    }

    async get(): Promise<StandloneModbusClient> {
        if (this.#freeElements.length > 0) {
            return this.#freeElements.pop()!
        }
        return new Promise<StandloneModbusClient>(resolve => {
            this.#requestQueue.push(resolve)
        })
    }

    #refund(element: StandloneModbusClient): void {
        if (this.#requestQueue.length > 0) {
            this.#requestQueue.shift()!(element)
        } else {
            this.#freeElements.push(element)
        }
    }

    static #RefundAtEndHandler = class implements ProxyHandler<StandloneModbusClient> {
        #pool: StandloneModbusClientPool

        constructor(pool: StandloneModbusClientPool) {
            this.#pool = pool
        }

        get(target: StandloneModbusClient, propName: keyof StandloneModbusClient) {
            if (propName !== "end") {
                return target[propName];
            }
            return (callback?: () => void) => {
                this.#pool.#refund(target)
                return target[propName](callback);
            }
        }
    }
}