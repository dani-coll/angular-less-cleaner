'use strict'
import * as vscode from 'vscode'
import {LessElement} from './models/less-element'
import * as less2Object from './less2object'

const jsdom = require("jsdom")
const { JSDOM } = jsdom

// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    let excludedFolders : string = '**/node_modules/**'
    let startPosition: vscode.Position = new vscode.Position(0, 0)
    let htmlDoms: any[] = []
    vscode.workspace.findFiles('**/*.html', excludedFolders)
    .then( (uris: vscode.Uri[]) => {
        if(!uris.length) {
            vscode.window.showInformationMessage('No html files found')
            return
        }
        let promises: Thenable<vscode.TextDocument>[] = []
        uris.forEach( (uri: vscode.Uri) => {
            let promise =  vscode.workspace.openTextDocument(uri)
            promises.push(promise)
            Promise.all(promises)
            .then( (docs: vscode.TextDocument[]) => {
                docs.forEach( (doc) => {
                    let endPosition: vscode.Position = new vscode.Position(doc.lineCount, 0)
                    let fullRange: vscode.Range = new vscode.Range(startPosition, endPosition)
                    let dom = new JSDOM(doc.getText(fullRange))
                    htmlDoms.push(dom)
                })
            })
        })
    })

    vscode.languages.registerHoverProvider('less', {
        provideHover(document, position, token) {
            return new vscode.Hover('I am a hover!')
        }
    })

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        let editor = vscode.window.activeTextEditor
        if (!editor) return
        let document = editor.document
       
        let endPosition: vscode.Position = new vscode.Position(document.lineCount, 0)
        
        
        let decoration = vscode.window.createTextEditorDecorationType({backgroundColor: 'yellow'})
        let secondPosition: vscode.Position = new vscode.Position(0, 10)
        let range: vscode.Range = new vscode.Range(startPosition, secondPosition)
        let ranges: vscode.Range[] = []
        ranges.push(range)
        editor.setDecorations(decoration,ranges)

        let fullRange : vscode.Range  = new vscode.Range(startPosition, endPosition)
        let editorText: string = document.getText(fullRange)
        let lessElements: LessElement[] = less2Object.getLessObjects(editorText)
        
        console.log(lessElements)
    })

    context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
}