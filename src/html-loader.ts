import * as vscode from 'vscode'
import * as constants from './constants'
import * as textProcessor from './text-processor'
import {HtmlDom} from './models/html-dom'

const jsdom = require("jsdom")
const { JSDOM } = jsdom

export async function getWorkspaceHtmlDoms() : Promise<any[]> {
    let htmlDoms: HtmlDom[] = []
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
        let htmlDom = new HtmlDom(new JSDOM(doc.getText(fullRange)), doc.uri.fsPath)
        htmlDoms.push(htmlDom)
    })
    return htmlDoms 
}

export function loadHtml(encodedTemplate: string) : any {
    let decodedTemplate = textProcessor.decodeTemplate(encodedTemplate)
    return new JSDOM(decodedTemplate)
}
