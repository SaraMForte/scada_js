// import { SVG } from '/shared/lib/svg.min.js'

// window.addEventListener("load", () => {
//     useSymbolIntoSvg("the-svg", {symbolName:'yellow-circle-with-f', path:'/force-pow/force-symbol.svg'})
// })

// function useSymbolIntoSvg(objectSvg , {symbolName, path}) {
//     const svgDoc = getSvgDocumentElement(objectSvg)
//     const imgObject = SVG(svgDoc)
//     const imgUse = imgObject.use(symbolName, path)
//         .attr({ x: 70, y: 0, width: 70, height: 70 })
    
//     imgObject.add(imgUse)
// }

// function getSvgDocumentElement(objectSvg) {
//     const svgObjectElement = document.getElementById(objectSvg)
//     const svgDoc = svgObjectElement.contentDocument

//     if (!svgDoc) {
//         throw new Error("SVGdocument with ID 'the-svg' not found")
//     }
//     return svgDoc.documentElement
// }


