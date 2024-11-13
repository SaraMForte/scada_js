export interface Refreshable {
    refresh() : Promise<void>
    refreshLoop(loopTime : number) : Promise<void>
}

export async function refreshLoop(refreshable : Refreshable, loopTime : number) {
    const refreshStep = () => refreshLoop(refreshable, loopTime)

    await refreshable.refresh()
        .then(() => setTimeout(refreshStep, loopTime))
        .catch(error => {
            console.error(error)
            setTimeout(refreshStep, loopTime * 5)
        })
}
