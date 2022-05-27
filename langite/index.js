"use strict";
var Langite;
(function (Langite) {
    class Error {
    }
    Langite.Error = Error;
    class UnexpectedCharacter extends Error {
        constructor(location, character) {
            super();
            this.Location = location;
            this.Character = character;
        }
        GetLocation() {
            return this.Location;
        }
        GetMessage() {
            return `${this.Location}: Error: Unexpected character '${this.Character}'`;
        }
    }
    Langite.UnexpectedCharacter = UnexpectedCharacter;
})(Langite || (Langite = {}));
var Langite;
(function (Langite) {
    class SourceLocation {
        constructor(filepath, source, position, line, column) {
            this.toString = () => {
                return `${this.Filepath}:${this.Line}:${this.Column}`;
            };
            this.Filepath = filepath;
            this.Source = source;
            this.Position = position;
            this.Line = line;
            this.Column = column;
        }
        Clone() {
            return new SourceLocation(this.Filepath, this.Source, this.Position, this.Line, this.Column);
        }
    }
    Langite.SourceLocation = SourceLocation;
})(Langite || (Langite = {}));
var Langite;
(function (Langite) {
    let TokenKind;
    (function (TokenKind) {
        TokenKind["EndOfFile"] = "EOF";
        TokenKind["Name"] = "Name";
    })(TokenKind = Langite.TokenKind || (Langite.TokenKind = {}));
    class Token {
        constructor(kind, location, length, value = null) {
            this.Kind = kind;
            this.Location = location;
            this.Length = length;
            this.Value = value;
        }
    }
    Langite.Token = Token;
})(Langite || (Langite = {}));
var Langite;
(function (Langite) {
    const SingleCharacters = { '\0': Langite.TokenKind.EndOfFile };
    const DoubleCharacters = {};
    class Lexer {
        constructor(filepath, source) {
            this.Location = new Langite.SourceLocation(filepath, source, 0, 1, 1);
        }
        NextToken() {
            while (true) {
                const startLocation = this.Location.Clone();
                if (this.Current().match(/ |\r|\v|\f/)) {
                    this.NextChar();
                    continue;
                }
                if (this.Current().match(/\w/)) {
                    let name = "";
                    while (this.Current().match(/\w|\d|\_/)) {
                        name += this.NextChar();
                    }
                    return new Langite.Token(Langite.TokenKind.Name, startLocation, this.Location.Position - startLocation.Position, name);
                }
                const char = this.NextChar();
                if (DoubleCharacters[char] !== undefined && DoubleCharacters[char][this.Current()] !== undefined) {
                    const second_char = this.NextChar();
                    return new Langite.Token(DoubleCharacters[char][second_char], startLocation, this.Location.Position - startLocation.Position);
                }
                if (SingleCharacters[char] !== undefined)
                    return new Langite.Token(SingleCharacters[char], startLocation, this.Location.Position - startLocation.Position);
                throw new Langite.UnexpectedCharacter(startLocation, char);
            }
        }
        Current() {
            if (this.Location.Position < this.Location.Source.length)
                return this.Location.Source[this.Location.Position];
            return '\0';
        }
        NextChar() {
            const current = this.Current();
            if (current !== '\0') {
                this.Location.Position++;
                this.Location.Column++;
                if (current == '\n') {
                    this.Location.Line++;
                    this.Location.Column = 1;
                }
            }
            return current;
        }
    }
    Langite.Lexer = Lexer;
})(Langite || (Langite = {}));
function OnCompile(filepath, source) {
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
    }
    catch (e) {
        if (!(e instanceof Langite.Error)) {
            throw e;
        }
        return e.GetMessage();
    }
}
window.addEventListener('load', () => {
    const CodeInput = document.getElementById("code_input");
    const Output = document.getElementById("output");
    const CompileButton = document.getElementById("compile");
    CompileButton.addEventListener('click', () => {
        Output.value = OnCompile("unknown.langite", CodeInput.value);
        const lines = Output.value.split(/\n|\r|\r\n/);
        let cols = Output.cols;
        lines.forEach(line => cols = Math.max(cols, line.length));
        let rows = Math.max(lines.length, Output.rows);
        Output.cols = cols;
        Output.rows = rows;
    });
});
//# sourceMappingURL=index.js.map