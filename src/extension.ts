'use strict'
import * as vscode from 'vscode'
import {LessElement} from './models/less-element'
import * as less2Object from './less2object'
import * as htmlLoader from './html-loader'
import * as angularLoader from './angular-loader'
import {HtmlDom} from './models/html-dom'

// The extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {

    let htmlDoms: HtmlDom[] = await htmlLoader.getWorkspaceHtmlDoms()

    let angularComponents = await angularLoader.getWorkspaceAngularComponents()
    angularComponents = angularLoader.mapDomsToComponent(angularComponents, htmlDoms)

    /*
    vscode.languages.registerHoverProvider('less', {
        provideHover(document, position, token) {
            return new vscode.Hover('I am a hover!')
        }
    })
    */

    let disposable = vscode.commands.registerCommand('extension.sayHello',  async () => {
        // The code you place here will be executed every time your command is executed
        
        let editor = vscode.window.activeTextEditor
        if (!editor) return
        let document = editor.document
               
        let startPosition: vscode.Position = new vscode.Position(0, 0)

        /*
        let decoration = vscode.window.createTextEditorDecorationType({backgroundColor: 'yellow'})
        let secondPosition: vscode.Position = new vscode.Position(0, 10)
        let range: vscode.Range = new vscode.Range(startPosition, secondPosition)
        let ranges: vscode.Range[] = []
        ranges.push(range)
        editor.setDecorations(decoration,ranges)
        */

        let endPosition: vscode.Position = new vscode.Position(document.lineCount, 0)
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