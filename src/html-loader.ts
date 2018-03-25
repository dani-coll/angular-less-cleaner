import * as vscode from 'vscode'
import * as constants from './constants'
import * as textProcessor from './text-processor'

const jsdom = require("jsdom")
const { JSDOM } = jsdom

export async function getWorkspaceHtmlDoms() : Promise<any[]> {
    let htmlDoms: any[] = []
    let uris: vscode.Uri[] = await vscode.workspace.findFiles('**/*.html', constants.excludedFolders)
    if(!uris.length) {
        vscode.window.showInformationMessage('No html files found')
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
        htmlDoms.push(new JSDOM(doc.getText(fullRange)))
    })
    return htmlDoms 
}

export function loadHtml(template: string) : any {
    let decodedTemplate = textProcessor.decodeTemplate(template)
    return new JSDOM(decodedTemplate)
}
