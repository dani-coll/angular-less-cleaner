export function ignoreDetails(text: string): string {
    text = text.replace(/(\[[^]+\])/ig, '') //Ignore attributes
    return text.replace(/(:[^]+)/ig, '') //Ignore semiclass
}






































export function ignoreInnerStrings(text: string) {
    text = text.replace(/('[^]+')/ig, "''")
    text = text.replace(/(`[^]+`)/ig, '``')
    return text.replace(/("[^]+")/ig, '""')
}

export function ignoreStyles(text: string) : string {
    let lastStyleIndex = text.lastIndexOf(';') //ignore styles
    let openBraceIndex = text.indexOf('{') //ignore styles
    if(openBraceIndex === -1 || openBraceIndex > lastStyleIndex) text = text.substring(lastStyleIndex + 1)
    return text
}

//Replace comments and spaces
//TODO make it work for /* */ after the css element
export function removeTrash(text: string): string {
    text = ignoreStyles(text)
    text = text.replace(/(\/\*[^]+\*\/)/ig, '') 
    text = text.replace(/(\/\/[^]+\n)/ig, '')
    text = text.replace(/\n/g, '')
    text = text.replace(/\s/g, '')
    text = text.replace(/\r/g, '')
    return text = text.replace(/ /g, '')
}

export function getEndlinesCount(substractedText: string) : number {
    return (substractedText.match(/\n/g) || []).length
}

export function prepareJsonForParse(text: string) : string {
    return text.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ')
}
