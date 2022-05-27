/// <reference path="./Lexer.ts"/>

function OnCompile(filepath: string, source: string): string {
    try {
        const lexer = new Langite.Lexer(filepath, source);
        let result = "";
        while (true) {
            const token = lexer.NextToken();
            result += `${token.Location}: '${token.Kind}'`;
            if (token.Value !== null)
                result += `, Data: ${token.Value}`;
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

window.addEventListener('load', (): void => {
    const CodeInput = document.getElementById("code_input") as HTMLTextAreaElement;
    const Output = document.getElementById("output") as HTMLTextAreaElement;
    const CompileButton = document.getElementById("compile") as HTMLButtonElement;

    CompileButton.addEventListener('click', (): void => {
        Output.value = OnCompile("unknown.langite", CodeInput.value);
        const lines = Output.value.split(/\n|\r|\r\n/);
        let cols = Output.cols;
        lines.forEach(line => cols = Math.max(cols, line.length));
        let rows = Math.max(lines.length, Output.rows);
        Output.cols = cols;
        Output.rows = rows;
    });
});
