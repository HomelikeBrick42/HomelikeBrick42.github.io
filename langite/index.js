"use strict";
var Langite;
(function (Langite) {
    class Error {
    }
    Langite.Error = Error;
    class Unimplemented extends Error {
        constructor(location, message) {
            super();
            this.Location = location;
            this.Message = message;
        }
        GetLocation() {
            return this.Location;
        }
        GetMessage() {
            return `${this.Location}: ${this.Message}`;
        }
    }
    Langite.Unimplemented = Unimplemented;
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
        TokenKind["Newline"] = "Newline";
        TokenKind["Name"] = "Name";
        TokenKind["Integer"] = "Integer";
        TokenKind["Float"] = "Float";
        TokenKind["OpenParenthesis"] = "(";
        TokenKind["CloseParenthesis"] = ")";
        TokenKind["OpenBrace"] = "{";
        TokenKind["CloseBrace"] = "}";
        TokenKind["Plus"] = "+";
        TokenKind["Minus"] = "-";
        TokenKind["Asterisk"] = "*";
        TokenKind["Slash"] = "/";
        TokenKind["Percent"] = "%";
        TokenKind["Colon"] = ":";
        TokenKind["Comma"] = ",";
        TokenKind["Equal"] = "=";
        TokenKind["EqualEqual"] = "==";
        TokenKind["ExclamationMark"] = "!";
        TokenKind["ExclamationMarkEqual"] = "!=";
        TokenKind["LessThan"] = "<";
        TokenKind["GreaterThan"] = ">";
        TokenKind["LessThanEqual"] = "<=";
        TokenKind["GreaterThanEqual"] = ">=";
        TokenKind["LeftArrow"] = "<-";
        TokenKind["RightArrow"] = "->";
        TokenKind["ProcKeyword"] = "proc";
        TokenKind["FuncKeyword"] = "func";
        TokenKind["ReturnKeyword"] = "return";
        TokenKind["IfKeyword"] = "if";
        TokenKind["ElseKeyword"] = "else";
        TokenKind["WhileKeyword"] = "while";
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
    const Keywords = {
        "proc": Langite.TokenKind.ProcKeyword,
        "func": Langite.TokenKind.FuncKeyword,
        "return": Langite.TokenKind.ReturnKeyword,
        "if": Langite.TokenKind.IfKeyword,
        "else": Langite.TokenKind.ElseKeyword,
        "while": Langite.TokenKind.WhileKeyword,
    };
    const SingleCharacters = {
        '\0': Langite.TokenKind.EndOfFile,
        '\n': Langite.TokenKind.Newline,
        '\r': Langite.TokenKind.Newline,
        '(': Langite.TokenKind.OpenParenthesis,
        ')': Langite.TokenKind.CloseParenthesis,
        '{': Langite.TokenKind.OpenBrace,
        '}': Langite.TokenKind.CloseBrace,
        '+': Langite.TokenKind.Plus,
        '-': Langite.TokenKind.Minus,
        '*': Langite.TokenKind.Asterisk,
        '/': Langite.TokenKind.Slash,
        '%': Langite.TokenKind.Percent,
        ':': Langite.TokenKind.Colon,
        ',': Langite.TokenKind.Comma,
        '=': Langite.TokenKind.Equal,
        '!': Langite.TokenKind.ExclamationMark,
        '<': Langite.TokenKind.LessThan,
        '>': Langite.TokenKind.GreaterThan,
    };
    const DoubleCharacters = {
        '\r': { '\n': Langite.TokenKind.Newline },
        '\n': { '\r': Langite.TokenKind.Newline },
        '=': { '=': Langite.TokenKind.EqualEqual },
        '!': { '=': Langite.TokenKind.ExclamationMarkEqual },
        '<': { '=': Langite.TokenKind.LessThanEqual, '-': Langite.TokenKind.LeftArrow },
        '>': { '=': Langite.TokenKind.GreaterThanEqual },
        '-': { '>': Langite.TokenKind.RightArrow },
    };
    class Lexer {
        constructor(filepath, source) {
            this.Location = new Langite.SourceLocation(filepath, source, 0, 1, 1);
        }
        NextToken() {
            while (true) {
                const startLocation = this.Location.Clone();
                if (this.Current().match(/[ \r\v\f]/)) {
                    this.NextChar();
                    continue;
                }
                if (this.Current().match(/[A-Za-z_]/)) {
                    let name = "";
                    while (this.Current().match(/[A-Za-z0-9_]/)) {
                        name += this.NextChar();
                    }
                    if (Keywords[name] !== undefined) {
                        return new Langite.Token(Keywords[name], startLocation, this.Location.Position - startLocation.Position);
                    }
                    return new Langite.Token(Langite.TokenKind.Name, startLocation, this.Location.Position - startLocation.Position, name);
                }
                if (this.Current().match(/[0-9]/)) {
                    let number = "";
                    while (this.Current().match(/[A-Za-z0-9]/)) {
                        number += this.NextChar();
                    }
                    if (this.Current() == '.') {
                        this.NextChar();
                        while (this.Current().match(/[A-Za-z0-9]/)) {
                            number += this.NextChar();
                        }
                        const float = parseInt(number);
                        return new Langite.Token(Langite.TokenKind.Integer, startLocation, this.Location.Position - startLocation.Position, float);
                    }
                    const integer = parseInt(number);
                    return new Langite.Token(Langite.TokenKind.Integer, startLocation, this.Location.Position - startLocation.Position, integer);
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
function PrintTokens(filepath, source) {
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
    }
    catch (e) {
        if (!(e instanceof Langite.Error)) {
            throw e;
        }
        return e.GetMessage();
    }
}
const SaveKey = "Langite";
window.addEventListener('load', () => {
    const CodeInput = document.getElementById("code_input");
    const Output = document.getElementById("output");
    const ShowTokens = document.getElementById("show_tokens");
    const loadedData = window.localStorage.getItem(SaveKey);
    if (loadedData !== null) {
        CodeInput.value = loadedData;
        ResizeTextArea(CodeInput);
    }
    ShowTokens.addEventListener('click', () => {
        Output.value = PrintTokens("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });
    window.addEventListener('beforeunload', () => {
        window.localStorage.setItem(SaveKey, CodeInput.value);
    });
});
function ResizeTextArea(textArea) {
    const lines = textArea.value.split(/\n|\r|\r\n/);
    let cols = textArea.cols;
    lines.forEach(line => cols = Math.max(cols, line.length));
    const rows = Math.max(lines.length, textArea.rows);
    textArea.cols = cols;
    textArea.rows = rows;
}
//# sourceMappingURL=index.js.map