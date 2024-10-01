export type SvgItemFrangmentKeys = {
    valueKey : string
    warnValueKey : string
    forceValueKey : string
}

export type SvgItemsKeys = {
    [svgItem : string] : SvgItemFrangmentKeys
}


export const SCADA_SVG_ITEMS_KEYS : SvgItemsKeys = {
    // 'InletHopper1-hopper' : {
    //     valueKey : 'A',
    //     warnValueKey : 'B',
    //     forceValueKey : 'C'
    // },
    'motor1' : {
        valueKey : 'D',
        warnValueKey : 'E',
        forceValueKey : 'F'
    }
}

