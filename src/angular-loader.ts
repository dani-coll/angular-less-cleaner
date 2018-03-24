import * as vscode from 'vscode'
import * as constants from './constants'
import * as textProcessor from './text-processor'

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
            let componentString = textProcessor.ignoreInnerStrings(tsText)
            let objectStartIndex = componentString.indexOf('{')
            let objectEndIndex = componentString.indexOf('}') + 1
            componentString = componentString.substring(objectStartIndex, objectEndIndex)
            componentString = textProcessor.prepareJsonForParse(componentString)
            let component = JSON.parse(componentString)
            angularComponents.push(component)
        }
    })
    return angularComponents
    
}