/// <reference path="./Lexer.ts"/>
/// <reference path="./Ast.ts"/>
/// <reference path="./Parser.ts"/>

function PrintTokens(filepath: string, source: string): string {
    try {
        const lexer = new Langite.Lexer(filepath, source);
        let result = "";
        while (true) {
            const token = lexer.NextToken();
            result += `${token.Location}: '${token.Kind}'`;
            if (token.Value !== null)
                result += `, Data: "${token.Value}"`;
            result += '\n';
            if (token.Kind === Langite.TokenKind.EndOfFile)
                break;
        }
        return result;
    } catch (e) {
        if (!(e instanceof Langite.Error)) {
            throw e;
        }
        return e.GetMessage();
    }
}

function PrintAst(filepath: string, source: string): string {
    try {
        const parser = new Langite.Parser(filepath, source);
        const file = parser.ParseFile();
        return file.Print(0);
    } catch (e) {
        if (!(e instanceof Langite.Error)) {
            throw e;
        }
        return e.GetMessage();
    }
}

const SaveKey = "Langite";

window.addEventListener('load', (): void => {
    const CodeInput = document.getElementById("code_input") as HTMLTextAreaElement;
    const Output = document.getElementById("output") as HTMLTextAreaElement;
    const ShowTokens = document.getElementById("show_tokens") as HTMLButtonElement;
    const ShowAst = document.getElementById("show_ast") as HTMLButtonElement;

    const loadedData = window.localStorage.getItem(SaveKey);
    if (loadedData !== null) {
        CodeInput.value = loadedData;
        ResizeTextArea(CodeInput);
    }

    ShowTokens.addEventListener('click', (): void => {
        Output.value = PrintTokens("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });

    ShowAst.addEventListener('click', (): void => {
        Output.value = PrintAst("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });

    window.addEventListener('beforeunload', (): void => {
        window.localStorage.setItem(SaveKey, CodeInput.value);
    });
});

function ResizeTextArea(textArea: HTMLTextAreaElement): void {
    const lines = textArea.value.split(/\n|\r|\r\n/);
    let cols = textArea.cols;
    lines.forEach(line => cols = Math.max(cols, line.length));
    const rows = Math.max(lines.length, textArea.rows);
    textArea.cols = cols;
    textArea.rows = rows;
}
