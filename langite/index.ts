/// <reference path="./Lexer.ts"/>
/// <reference path="./Ast.ts"/>
/// <reference path="./Parser.ts"/>
/// <reference path="./NameResolver.ts"/>
/// <reference path="./TypeResolver.ts"/>

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
        return e.Message;
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
        return e.Message;
    }
}

function CheckAst(filepath: string, source: string): string {
    try {
        const parser = new Langite.Parser(filepath, source);
        const file = parser.ParseFile();
        Langite.ResolveNames(file, [{}], [{
            "void": Langite.AstBuiltin.CreateConstDeclaration("void", Langite.AstBuiltinKind.Void),
            "type": Langite.AstBuiltin.CreateConstDeclaration("type", Langite.AstBuiltinKind.Type),
            "bool": Langite.AstBuiltin.CreateConstDeclaration("bool", Langite.AstBuiltinKind.Bool),
            "int": Langite.AstBuiltin.CreateConstDeclaration("int", Langite.AstBuiltinKind.Int),
            "uint": Langite.AstBuiltin.CreateConstDeclaration("uint", Langite.AstBuiltinKind.UInt),
            "float": Langite.AstBuiltin.CreateConstDeclaration("float", Langite.AstBuiltinKind.Float),
            "print_int": Langite.AstBuiltin.CreateConstDeclaration("print_int", Langite.AstBuiltinKind.PrintInt),
            "print_uint": Langite.AstBuiltin.CreateConstDeclaration("print_uint", Langite.AstBuiltinKind.PrintUInt),
            "println": Langite.AstBuiltin.CreateConstDeclaration("println", Langite.AstBuiltinKind.Println),
        }], 1);
        Langite.ResolveTypes(file, null);
        return file.Print(0);
    } catch (e) {
        if (!(e instanceof Langite.Error)) {
            throw e;
        }
        return e.Message;
    }
}

const SaveKey = "Langite";

window.addEventListener('load', (): void => {
    const Example = document.getElementById("example") as HTMLButtonElement;
    const CodeInput = document.getElementById("code_input") as HTMLTextAreaElement;
    const Output = document.getElementById("output") as HTMLTextAreaElement;
    const ShowTokensButton = document.getElementById("show_tokens") as HTMLButtonElement;
    const ShowAstButton = document.getElementById("show_ast") as HTMLButtonElement;
    const CheckAstButton = document.getElementById("check_ast") as HTMLButtonElement;

    const loadedData = window.localStorage.getItem(SaveKey);
    if (loadedData !== null) {
        CodeInput.value = loadedData;
        ResizeTextArea(CodeInput);
    }

    Example.addEventListener('click', (): void => {
        CodeInput.value = `foo :: func(a: int, b: int, c: int) -> int {
    return a + b * c
}

factorial :: func(n: uint) -> uint {
    if n <= 1 {
        return n
    }
    return n * factorial(n - 1)
}

main :: proc() -> void {
    a := foo(1, 2, 3)
    print_int(a)
    println()

    fact_6 := factorial(6)
    print_uint(fact_6)
    println()
}`;
        ResizeTextArea(CodeInput);
    });

    ShowTokensButton.addEventListener('click', (): void => {
        Output.value = PrintTokens("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });

    ShowAstButton.addEventListener('click', (): void => {
        Output.value = PrintAst("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });

    CheckAstButton.addEventListener('click', (): void => {
        Output.value = CheckAst("unknown.langite", CodeInput.value);
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
