'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "angular-less-cleaner" is now active!')

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        let editor = vscode.window.activeTextEditor
        if (!editor) return
        let document = editor.document
        let startPosition: vscode.Position = new vscode.Position(0, 0)
        let endPosition: vscode.Position = new vscode.Position(document.lineCount, 0)
        let fullRange : vscode.Range  = new vscode.Range(startPosition, endPosition)
        let excludedFolders : string = '**/node_modules/**'
        let editorText: string = document.getText(fullRange)
        let previousIndex = 0
        while(editorText.length > 0) {
            let braceIndex = editorText.search(/{/)
            if(braceIndex === -1) breakç
            let previousInfo = editorText.substring(previousIndex, braceIndex)
            editorText = editorText.substring(braceIndex)
            let sPreviousInfo = previousInfo.lastIndexOf(';')
            if(sPreviousInfo !== -1 ) previousInfo = previousInfo.substring(sPreviousInfo + 1)

            //Replace comments and spaces
            //TODO make it work for /* */ after the css element
            previousInfo = previousInfo.replace(/(\/\*[^]+\*\/)/ig, '') 

            previousInfo = previousInfo.replace(/(\/\/[^]+\n)/ig, '')
            previousInfo = previousInfo.replace(/ /g, '')
            previousInfo = previousInfo.replace(/\n/g, '')
            let cssElements : string[] = previousInfo.split(',')
            cssElements.forEach( element => {
                element = element.replace(/(\[[^]+\])/ig, '') //Ignore attributes
                element = element.replace(/(:[^]+)/ig, '') //Ignore semiclass
                if(element.length && element != '*') {
                    let isIdentifier = element[0] == '#'
                    let isClass = element[0] == '.'
                    let isElement = !isClass && !isIdentifier

                    console.log('busca a la dom')
                }
            })
            console.log(previousInfo)
            let closeBrace = editorText.search(/}/)
            let openBrace = editorText.search(/{/)
            if(openBrace < closeBrace) //it has inner elements
            {
                
            }
            if(closeBrace === -1) break
            editorText = editorText.substring(closeBrace + 1)
        }

        vscode.workspace.findFiles('**/*.html', excludedFolders)
        .then( (uris: vscode.Uri[]) =>{
            if(!uris.length) {
                vscode.window.showInformationMessage('No html files found')
                return
            }
            vscode.workspace.openTextDocument(uris[0])
            .then( (doc: vscode.TextDocument) => {
                let endPosition: vscode.Position = new vscode.Position(doc.lineCount, 0)
                let fullRange  = new vscode.Range(startPosition, endPosition)
                let text = doc.getText(fullRange)
                vscode.window.showInformationMessage('Selected characters: ' + text)

            })
        })
    });

    context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
}