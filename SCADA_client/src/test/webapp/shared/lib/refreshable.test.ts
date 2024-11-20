/// @vitest-environment jsdom
import { Refreshable, refreshLoop } from '@webapp/shared/lib/refreshable'
import sinon from 'sinon'
import { describe, expect, test } from 'vitest'

class DummyRefresable implements Refreshable {
    param: string
    isRefreshLoopStopped: boolean

    constructor(param: string) {
        this.param = param
        this.isRefreshLoopStopped = false
    }

    async refresh() {
        await this.testDummy(this.param)
    }
    async refreshLoop(loopTime: number): Promise<void> {
        this.isRefreshLoopStopped = false
        await refreshLoop(this, loopTime)
    }
    stopRefreshLoop(): void {
        this.isRefreshLoopStopped = true
    }
    async testDummy(param: string): Promise<void> {
        if (param === 'testError') {
            throw Error('testError')
        } else {
            return
        }
    }
}

describe('Refresing', () => {
    test('GIVEN class implement Refresable WHEN refresh THEN refresh correctly', async () => {
        const dummyRefresable = new DummyRefresable('test')

        dummyRefresable.refreshLoop(1000)
        
        const refreshLoopSpy = sinon.spy(dummyRefresable, 'refreshLoop')

        await dummyRefresable.refreshLoop(1000)

        expect(refreshLoopSpy.calledOnce).toBe(true)
        expect(refreshLoopSpy.calledWith(1000)).toBe(true)
        expect(dummyRefresable.isRefreshLoopStopped).toBe(false)

        await new Promise<string>(resolve => setTimeout(() => resolve('Hello'), 1000))

        dummyRefresable.stopRefreshLoop()
        expect(dummyRefresable.isRefreshLoopStopped).toBe(true)
        refreshLoopSpy.restore()
    })

    test('GIVEN class implement Refresh WHEN refresh with error THEN throw error', async () => {
        const dummyRefresable = new DummyRefresable('testError')

        const consoleErrorSpy = sinon.spy(console, 'error')

        await dummyRefresable.refreshLoop(1000)

        expect(consoleErrorSpy.calledOnce).toBe(true)
    })
})
