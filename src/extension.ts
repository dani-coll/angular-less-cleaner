'use strict'
import * as vscode from 'vscode'

const jsdom = require("jsdom")
const { JSDOM } = jsdom

// The extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    console.log('angular-less-cleaner is now active')

    let excludedFolders : string = '**/node_modules/**'
    let startPosition: vscode.Position = new vscode.Position(0, 0)
    let htmlDoms: any[] = []
    vscode.workspace.findFiles('**/*.html', excludedFolders)
    .then( (uris: vscode.Uri[]) =>{
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
    });

    let disposable = vscode.commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed
        let editor = vscode.window.activeTextEditor
        if (!editor) return
        let document = editor.document
       
        let endPosition: vscode.Position = new vscode.Position(document.lineCount, 0)
        
        
        let snipet: vscode.SnippetString = new vscode.SnippetString("siiuu")
        let decoration = vscode.window.createTextEditorDecorationType({backgroundColor: 'yellow'})
        let secondPosition: vscode.Position = new vscode.Position(0, 10)
        let range: vscode.Range = new vscode.Range(startPosition, secondPosition)
        let ranges: vscode.Range[] = []
        ranges.push(range)
        editor.setDecorations(decoration,ranges)



        let fullRange : vscode.Range  = new vscode.Range(startPosition, endPosition)
        let editorText: string = document.getText(fullRange)
        let previousIndex = 0
        while(editorText.length > 0) {
            let braceIndex = editorText.search(/{/)
            if(braceIndex === -1) break
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
    });

    context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
}