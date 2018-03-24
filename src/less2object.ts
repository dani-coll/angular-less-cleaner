import {LessElement, ElementType} from './models/less-element'

import * as textProcessor from './text-processor'

let lines: number

function updateCounters(substractedText: string) {
    lines += textProcessor.getEndlinesCount(substractedText)
}

function getElement(elementDeclaration: string, parent?: LessElement): LessElement {
    let child: LessElement = new LessElement()
    child.parent = parent
    child.startRow = lines
    child.fullName = elementDeclaration
    elementDeclaration = textProcessor.ignoreDetails(elementDeclaration)
    child.name = elementDeclaration
    if(elementDeclaration.length) {
        if(elementDeclaration[0] === "#") child.type = ElementType.Id
        else if(elementDeclaration[0] === "*") child.type = ElementType.All
        else if(elementDeclaration[0] === ".") child.type = ElementType.Class
        else child.type = ElementType.Tag
    }
    return child
}

//endrow del 2n fill no es posa be
function getMainElementTree(text : string): [LessElement[], string] {
    let elements: LessElement[] = []
    let balance: number = -1 //the text has already removed the first {
    let openBraceIndex: number = text.indexOf('{')
    let closeBraceIndex: number = -1
    let elementDeclaration: string
    elementDeclaration = text.substring(0, openBraceIndex)
    let siblingElementDeclarations : string[] = elementDeclaration.split(',')
    let siblingElements : LessElement[] = []
    let siblingRows: number = 0
    siblingElementDeclarations.forEach(declaration => {
        let cleanName = textProcessor.removeTrash(declaration)
        let element: LessElement = getElement(cleanName)
        siblingRows += textProcessor.getEndlinesCount(declaration)
        element.startRow = lines + siblingRows
        if(siblingElements[0]) siblingElements[0].littleBrothers.push(element)
        else siblingElements.push(element)
    })
    if(siblingElements.length) {
        let currentParent: LessElement | undefined = siblingElements[0]
        let limitIndex = text.indexOf('{') + 1
        updateCounters(text.substring(0, limitIndex))
        text = text.substring(limitIndex)

        while(balance !== 0) {
            openBraceIndex = text.indexOf('{')
            closeBraceIndex = text.indexOf('}')
            if(closeBraceIndex === -1) break
            if(openBraceIndex !== -1 && openBraceIndex < closeBraceIndex) {
                --balance
                openBraceIndex = text.indexOf('{')
                elementDeclaration = text.substring(0, openBraceIndex)
                siblingRows = textProcessor.getEndlinesCount(elementDeclaration)
                elementDeclaration = textProcessor.removeTrash(elementDeclaration)
                elementDeclaration = textProcessor.ignoreStyles(elementDeclaration)

                let childSiblingElements : string[] = elementDeclaration.split(',')
                
                for(let i = 0; i < childSiblingElements.length; ++i) {
                    let element = getElement(childSiblingElements[i], currentParent)
                    siblingRows += textProcessor.getEndlinesCount(childSiblingElements[i])
                    element.startRow = lines + siblingRows
                    if(i > 0) currentParent!.children[0].littleBrothers.push(element)
                    else currentParent!.children.push(element)
                }
                if(currentParent!.children.length) currentParent = currentParent!.children[currentParent!.children.length-1]

                updateCounters(text.substring(0, openBraceIndex + 1))
                text = text.substring(openBraceIndex + 1)
            } else {
                ++balance
                updateCounters(text.substring(0, closeBraceIndex + 1))
                text = text.substring(closeBraceIndex + 1)
                currentParent!.endRow = lines
                currentParent = currentParent!.parent
            }
        }

        for(let i = 0; i < siblingElements.length; ++i) {

            if(i > 0) {
                siblingElements[i].children = siblingElements[0].children
            }
            elements.push(siblingElements[i])
        }
    }
    return [elements, text]
}

export function getLessObjects(textDocument: string) : LessElement[] {
    let lessElements: LessElement[] = []
    lines = 1
    while(textDocument.length > 0) {
        let braceIndex = textDocument.search(/{/)
        if(braceIndex === -1) break
    
        let mainElementTreeResponse = getMainElementTree(textDocument)
        lessElements = lessElements.concat(mainElementTreeResponse[0])
        textDocument = mainElementTreeResponse[1]
    }
    return lessElements
        
}
