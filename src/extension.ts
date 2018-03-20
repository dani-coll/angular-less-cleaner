'use strict'
import * as vscode from 'vscode'
import {LessElement, ElementType} from './models/less-element'

const jsdom = require("jsdom")
const { JSDOM } = jsdom



function getElement(elementDeclaration: string, parent?: LessElement): LessElement {
    let child: LessElement = new LessElement()
    child.parent = parent
    child.fullName = elementDeclaration
    elementDeclaration = ignoreDetails(elementDeclaration)
    child.name = elementDeclaration
    if(elementDeclaration.length) {
        if(elementDeclaration[0] === "#") child.type = ElementType.Id
        else if(elementDeclaration[0] === "*") child.type = ElementType.All
        else if(elementDeclaration[0] === ".") child.type = ElementType.Class
        else child.type = ElementType.Tag
    }
    return child
}

function getMainElementTree(text : string): [LessElement[], string] {
    let elements: LessElement[] = []
    let balance: number = -1 //the text has already removed the first {
    let openBraceIndex: number = -1
    let closeBraceIndex: number = -1
    let elementDeclaration: string
    text = removeTrash(text)
    elementDeclaration = text.substring(0, text.indexOf('{'))
    let siblingElementDeclarations : string[] = elementDeclaration.split(',')
    let siblingElements : LessElement[] = []
    siblingElementDeclarations.forEach(e => {
        siblingElements.push(getElement(e, undefined))
    })
    if(siblingElements.length) {
        let currentParent: LessElement | undefined = siblingElements[0]
        text = text.substring(text.indexOf('{') + 1)

        while(balance !== 0) {
            openBraceIndex = text.indexOf('{')
            closeBraceIndex = text.indexOf('}')
            if(closeBraceIndex === -1) break
            if(openBraceIndex !== -1 && openBraceIndex < closeBraceIndex) {
                --balance
                elementDeclaration = text.substring(0, text.indexOf('{'))
                elementDeclaration = ignoreStyles(elementDeclaration)
                let childSiblingElements : string[] = elementDeclaration.split(',')
                childSiblingElements.forEach( e => {
                    currentParent!.children.push(getElement(e, currentParent))
                })
                if(currentParent!.children.length) currentParent = currentParent!.children[0]

                text = text.substring(openBraceIndex + 1)
            } else {
                ++balance
                text = text.substring(closeBraceIndex + 1)
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

function ignoreDetails(text: string): string {
    text = text.replace(/(\[[^]+\])/ig, '') //Ignore attributes
    return text.replace(/(:[^]+)/ig, '') //Ignore semiclass
}

function ignoreStyles(text: string) : string {
    let lastStyleIndex = text.lastIndexOf(';') //ignore styles
    let openBraceIndex = text.indexOf('{') //ignore styles
    if(openBraceIndex === -1 || openBraceIndex > lastStyleIndex) text = text.substring(lastStyleIndex + 1)
    return text
}

//Replace comments and spaces
//TODO make it work for /* */ after the css element
function removeTrash(text: string) {
    text = ignoreStyles(text)
    text = text.replace(/(\/\*[^]+\*\/)/ig, '') 
    text = text.replace(/(\/\/[^]+\n)/ig, '')
    text = text.replace(/\n/g, '')
    text = text.replace(/\s/g, '')
    text = text.replace(/\r/g, '')
    return text = text.replace(/ /g, '')
}

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
        let lessElements: LessElement[] = []
        while(editorText.length > 0) {
            let braceIndex = editorText.search(/{/)
            if(braceIndex === -1) break
            
            let mainElementTreeResponse = getMainElementTree(editorText)
            lessElements = lessElements.concat(mainElementTreeResponse[0])
            editorText = mainElementTreeResponse[1]
        }
        console.log(lessElements)
    })

    context.subscriptions.push(disposable)
}

// this method is called when your extension is deactivated
export function deactivate() {
}