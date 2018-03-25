import * as vscode from 'vscode'
import * as constants from './constants'
import * as textProcessor from './text-processor'
import * as htmlLoader from './html-loader'

export async function getWorkspaceAngularComponents() : Promise<any[]> {
    let angularComponents: any[] = []
    let uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.ts', constants.excludedFolders)
    if(!uris.length) {
        vscode.window.showInformationMessage('No ts files found')
        return []
    }
    let promises: Thenable<vscode.TextDocument>[] = []
    uris.forEach( (uri: vscode.Uri) => {
        let promise =  vscode.workspace.openTextDocument(uri)
        promises.push(promise)
    })
    let docs: vscode.TextDocument[] = await Promise.all(promises)
    let startPosition: vscode.Position = new vscode.Position(0, 0)
    docs.forEach(doc => {
        let endPosition: vscode.Position = new vscode.Position(doc.lineCount, 0)
        let fullRange: vscode.Range = new vscode.Range(startPosition, endPosition)
        let tsText: string = doc.getText(fullRange)
        let componentIndex = tsText.indexOf('@Component')
        if(componentIndex !== -1) {
            tsText = tsText.substring(componentIndex)
            let componentString = textProcessor.encodeTemplate(tsText)
            let objectStartIndex = componentString.indexOf('{')
            let objectEndIndex = componentString.indexOf('}')
            if(objectStartIndex !== -1 && objectEndIndex !== -1) {
                componentString = componentString.substring(objectStartIndex, objectEndIndex + 1)
                componentString = textProcessor.prepareJsonForParse(componentString)
                let component = JSON.parse(componentString)
                angularComponents.push(component)
            }
        }
    })
    return angularComponents
    
}
export function getAngularInlineTemplates(angularComponents): any[] {
    let inlineDoms: any[] = []
    angularComponents.forEach( component => {
        if(component.template) {
            let dom = htmlLoader.loadHtml(component.template)
            inlineDoms.push(dom)
        }
    })
    return inlineDoms
}
