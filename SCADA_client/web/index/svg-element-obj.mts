export type SvgElementObj = {
    [svgItem : string] : {
        valueKey : string
        warnValueKey : string
        forceValueKey : string
    }
}

export const SVG_ELEMENT_OBJ : SvgElementObj = {
    'InletHopper1-hopper' : {
        valueKey : 'A',
        warnValueKey : 'B',
        forceValueKey : 'C'
    },
}

