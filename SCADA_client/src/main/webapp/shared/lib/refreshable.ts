export interface Refreshable {
    isRefreshLoopStopped: boolean
    refresh(): Promise<void>
    refreshLoop(loopTime: number): Promise<void>
    stopRefreshLoop(): void
}

export async function refreshLoop(refreshable: Refreshable, loopTime: number) {
    const refreshStep = () => refreshLoop(refreshable, loopTime)

    await refreshable
        .refresh()
        .then(() => {
            if (!refreshable.isRefreshLoopStopped) {
                return setTimeout(refreshStep, loopTime)
            }
        })
        .catch(error => {
            console.error(error)
            if (!refreshable.isRefreshLoopStopped) {
                return setTimeout(refreshStep, loopTime * 5)
            }
        })
}
