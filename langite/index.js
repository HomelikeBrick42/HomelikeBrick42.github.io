"use strict";
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
    let AstKind;
    (function (AstKind) {
        AstKind["File"] = "File";
        AstKind["Scope"] = "Scope";
        AstKind["Declaration"] = "Declaration";
        AstKind["Name"] = "Name";
        AstKind["Integer"] = "Integer";
        AstKind["Float"] = "Float";
        AstKind["Unary"] = "Unary";
        AstKind["Binary"] = "Binary";
        AstKind["Call"] = "Call";
        AstKind["Function"] = "Function";
        AstKind["Procedure"] = "Procedure";
        AstKind["Return"] = "Return";
        AstKind["If"] = "If";
    })(AstKind = Langite.AstKind || (Langite.AstKind = {}));
    class Ast {
    }
    Langite.Ast = Ast;
    function GetIndent(indent) {
        let result = "";
        for (let i = 0; i < indent; i++) {
            result += "  ";
        }
        return result;
    }
    function PrintHeader(indent, ast) {
        return `${GetIndent(indent)}- ${ast.Kind}\n`;
    }
    class AstFile extends Ast {
        constructor(statements, endOfFileToken) {
            super();
            this.Kind = AstKind.File;
            this.Statements = statements;
            this.EndOfFileToken = endOfFileToken;
        }
        get Location() {
            const location = this.EndOfFileToken.Location.Clone();
            location.Position = 0;
            location.Line = 1;
            location.Column = 1;
            return location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Statements:\n`;
            this.Statements.forEach((statement) => {
                result += statement.Print(indent + 2);
            });
            return result;
        }
    }
    Langite.AstFile = AstFile;
    class AstScope extends Ast {
        constructor(openBraceToken, statements, closeBraceToken) {
            super();
            this.Kind = AstKind.Scope;
            this.OpenBraceToken = openBraceToken;
            this.Statements = statements;
            this.CloseBraceToken = closeBraceToken;
        }
        get Location() {
            return this.OpenBraceToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Statements:\n`;
            this.Statements.forEach((statement) => {
                result += statement.Print(indent + 2);
            });
            return result;
        }
    }
    Langite.AstScope = AstScope;
    class AstDeclaration extends Ast {
        constructor(nameToken, colonToken, type, colonOrEqualToken, value) {
            super();
            this.Kind = AstKind.Declaration;
            this.NameToken = nameToken;
            this.ColonToken = colonToken;
            this.Type = type;
            this.ColonOrEqualToken = colonOrEqualToken;
            this.Value = value;
        }
        get IsConstant() {
            return this.ColonOrEqualToken !== null && this.ColonOrEqualToken.Kind == Langite.TokenKind.Colon;
        }
        get Location() {
            return this.NameToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Name: '${this.NameToken.Value}'\n`;
            if (this.Type !== null) {
                result += `${GetIndent(indent + 1)}Type:\n`;
                result += this.Type.Print(indent + 2);
            }
            if (this.Value !== null) {
                result += `${GetIndent(indent + 1)}Value:\n`;
                result += this.Value.Print(indent + 2);
            }
            return result;
        }
    }
    Langite.AstDeclaration = AstDeclaration;
    class AstName extends Ast {
        constructor(nameToken) {
            super();
            this.Kind = AstKind.Name;
            this.NameToken = nameToken;
        }
        get Location() {
            return this.NameToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.NameToken.Value}'\n`;
            return result;
        }
    }
    Langite.AstName = AstName;
    class AstInteger extends Ast {
        constructor(integerToken) {
            super();
            this.Kind = AstKind.Integer;
            this.IntegerToken = integerToken;
        }
        get Location() {
            return this.IntegerToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.IntegerToken.Value}'\n`;
            return result;
        }
    }
    Langite.AstInteger = AstInteger;
    class AstFloat extends Ast {
        constructor(floatToken) {
            super();
            this.Kind = AstKind.Float;
            this.FloatToken = floatToken;
        }
        get Location() {
            return this.FloatToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.FloatToken.Value}'\n`;
            return result;
        }
    }
    Langite.AstFloat = AstFloat;
    class AstUnary extends Ast {
        constructor(operatorToken, operand) {
            super();
            this.Kind = AstKind.Unary;
            this.OperatorToken = operatorToken;
            this.Operand = operand;
        }
        get Location() {
            return this.OperatorToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}OperatorToken: '${this.OperatorToken.Kind}'\n`;
            result += `${GetIndent(indent + 1)}Operand:\n`;
            result += this.Operand.Print(indent + 2);
            return result;
        }
    }
    Langite.AstUnary = AstUnary;
    class AstBinary extends Ast {
        constructor(left, operatorToken, right) {
            super();
            this.Kind = AstKind.Binary;
            this.Left = left;
            this.OperatorToken = operatorToken;
            this.Right = right;
        }
        get Location() {
            return this.OperatorToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}OperatorToken: '${this.OperatorToken.Kind}'\n`;
            result += `${GetIndent(indent + 1)}Left:\n`;
            result += this.Left.Print(indent + 2);
            result += `${GetIndent(indent + 1)}Right:\n`;
            result += this.Right.Print(indent + 2);
            return result;
        }
    }
    Langite.AstBinary = AstBinary;
    class AstCall extends Ast {
        constructor(operand, openParenthesisToken, arguments_, closeParenthesisToken) {
            super();
            this.Kind = AstKind.Call;
            this.Operand = operand;
            this.OpenParenthesisToken = openParenthesisToken;
            this.Arguments = arguments_;
            this.CloseParenthesisToken = closeParenthesisToken;
        }
        get Location() {
            return this.OpenParenthesisToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Operand:\n`;
            result += this.Operand.Print(indent + 2);
            result += `${GetIndent(indent + 1)}Arguments:\n`;
            this.Arguments.forEach((argument) => {
                result += argument.Print(indent + 2);
            });
            return result;
        }
    }
    Langite.AstCall = AstCall;
    class AstFunction extends Ast {
        constructor(funcToken, openParenthesisToken, parameters, closeParenthesisToken, rightArrowToken, returnType, body) {
            super();
            this.Kind = AstKind.Function;
            this.FuncToken = funcToken;
            this.OpenParenthesisToken = openParenthesisToken;
            this.Parameters = parameters;
            this.CloseParenthesisToken = closeParenthesisToken;
            this.RightArrowToken = rightArrowToken;
            this.ReturnType = returnType;
            this.Body = body;
        }
        get Location() {
            return this.FuncToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Parameters:\n`;
            this.Parameters.forEach((parameter) => {
                result += parameter.Print(indent + 2);
            });
            result += `${GetIndent(indent + 1)}Return Type:\n`;
            this.ReturnType.Print(indent + 2);
            if (this.Body !== null) {
                result += `${GetIndent(indent + 1)}Body:\n`;
                result += this.Body.Print(indent + 2);
            }
            return result;
        }
    }
    Langite.AstFunction = AstFunction;
    class AstProcedure extends Ast {
        constructor(procToken, openParenthesisToken, parameters, closeParenthesisToken, rightArrowToken, returnType, body) {
            super();
            this.Kind = AstKind.Procedure;
            this.ProcToken = procToken;
            this.OpenParenthesisToken = openParenthesisToken;
            this.Parameters = parameters;
            this.CloseParenthesisToken = closeParenthesisToken;
            this.RightArrowToken = rightArrowToken;
            this.ReturnType = returnType;
            this.Body = body;
        }
        get Location() {
            return this.ProcToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Parameters:\n`;
            this.Parameters.forEach((parameter) => {
                result += parameter.Print(indent + 2);
            });
            result += `${GetIndent(indent + 1)}Return Type:\n`;
            this.ReturnType.Print(indent + 2);
            if (this.Body !== null) {
                result += `${GetIndent(indent + 1)}Body:\n`;
                result += this.Body.Print(indent + 2);
            }
            return result;
        }
    }
    Langite.AstProcedure = AstProcedure;
    class AstReturn extends Ast {
        constructor(returnToken, value) {
            super();
            this.Kind = AstKind.Return;
            this.ReturnToken = returnToken;
            this.Value = value;
        }
        get Location() {
            return this.ReturnToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            if (this.Value !== null) {
                result += `${GetIndent(indent + 1)}Value:\n`;
                result += this.Value.Print(indent + 2);
            }
            return result;
        }
    }
    Langite.AstReturn = AstReturn;
    class AstIf extends Ast {
        constructor(ifToken, condition, thenStatement, elseToken, elseStatement) {
            super();
            this.Kind = AstKind.If;
            this.IfToken = ifToken;
            this.Condition = condition;
            this.ThenStatement = thenStatement;
            this.ElseToken = elseToken;
            this.ElseStatement = elseStatement;
        }
        get Location() {
            return this.IfToken.Location;
        }
        Print(indent) {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Condition:\n`;
            result += this.Condition.Print(indent + 2);
            result += `${GetIndent(indent + 1)}ThenStatement:\n`;
            result += this.ThenStatement.Print(indent + 2);
            if (this.ElseStatement !== null) {
                result += `${GetIndent(indent + 1)}ElseStatement:\n`;
                result += this.ElseStatement.Print(indent + 2);
            }
            return result;
        }
    }
    Langite.AstIf = AstIf;
})(Langite || (Langite = {}));
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
    class UnexpectedToken extends Error {
        constructor(token) {
            super();
            this.Token = token;
        }
        GetLocation() {
            return this.Token.Location;
        }
        GetMessage() {
            return `${this.Token.Location}: Error: Unexpected token '${this.Token.Kind}'`;
        }
    }
    Langite.UnexpectedToken = UnexpectedToken;
    class ExpectedToken extends Error {
        constructor(expectedKind, gotToken) {
            super();
            this.ExpectedKind = expectedKind;
            this.GotToken = gotToken;
        }
        GetLocation() {
            return this.GotToken.Location;
        }
        GetMessage() {
            return `${this.GotToken.Location}: Error: Expected '${this.ExpectedKind}' but got '${this.GotToken.Kind}'`;
        }
    }
    Langite.ExpectedToken = ExpectedToken;
    class ExpectedNewline extends Error {
        constructor(gotToken) {
            super();
            this.GotToken = gotToken;
        }
        GetLocation() {
            return this.GotToken.Location;
        }
        GetMessage() {
            return `${this.GotToken.Location}: Error: Expected a newline but got '${this.GotToken.Kind}'`;
        }
    }
    Langite.ExpectedNewline = ExpectedNewline;
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
var Langite;
(function (Langite) {
    class Parser {
        constructor(filepath, source) {
            this.Lexer = new Langite.Lexer(filepath, source);
            this.Current = this.Lexer.NextToken();
        }
        ParseFile() {
            const statements = [];
            while (this.Current.Kind !== Langite.TokenKind.EndOfFile) {
                this.AllowMultipleNewlines();
                if (this.Current.Kind === Langite.TokenKind.EndOfFile)
                    break;
                statements.push(this.ParseStatement());
                this.ExpectNewline();
            }
            const endOfFileToken = this.NextToken();
            return new Langite.AstFile(statements, endOfFileToken);
        }
        ParseStatement() {
            switch (this.Current.Kind) {
                case Langite.TokenKind.OpenBrace:
                    return this.ParseScope();
                case Langite.TokenKind.IfKeyword:
                    return this.ParseIf();
                case Langite.TokenKind.ReturnKeyword: {
                    const returnToken = this.ExpectToken(Langite.TokenKind.ReturnKeyword);
                    let value = null;
                    if (this.Current.Kind !== Langite.TokenKind.Newline &&
                        this.Current.Kind !== Langite.TokenKind.EndOfFile &&
                        this.Current.Kind !== Langite.TokenKind.CloseBrace &&
                        this.Current.Kind !== Langite.TokenKind.CloseParenthesis) {
                        value = this.ParseExpression();
                    }
                    return new Langite.AstReturn(returnToken, value);
                }
                default: {
                    const expression = this.ParseExpression();
                    if (expression.Kind === Langite.AstKind.Name && this.Current.Kind === Langite.TokenKind.Colon) {
                        const name = expression;
                        const colonToken = this.ExpectToken(Langite.TokenKind.Colon);
                        let type = null;
                        if (this.Current.Kind !== Langite.TokenKind.Equal && this.Current.Kind !== Langite.TokenKind.Colon) {
                            type = this.ParseExpression();
                        }
                        let colonOrEqualToken = null;
                        let value = null;
                        if (this.Current.Kind === Langite.TokenKind.Equal || this.Current.Kind === Langite.TokenKind.Colon) {
                            colonOrEqualToken = this.NextToken();
                            value = this.ParseExpression();
                        }
                        return new Langite.AstDeclaration(name.NameToken, colonToken, type, colonOrEqualToken, value);
                    }
                    return expression;
                }
            }
        }
        ParseScope() {
            const openBraceToken = this.ExpectToken(Langite.TokenKind.OpenBrace);
            const statements = [];
            while (this.Current.Kind !== Langite.TokenKind.CloseBrace) {
                this.AllowMultipleNewlines();
                if (this.Current.Kind === Langite.TokenKind.EndOfFile)
                    break;
                statements.push(this.ParseStatement());
                this.ExpectNewline();
            }
            const closeBraceToken = this.ExpectToken(Langite.TokenKind.CloseBrace);
            return new Langite.AstScope(openBraceToken, statements, closeBraceToken);
        }
        ParseIf() {
            const ifToken = this.ExpectToken(Langite.TokenKind.IfKeyword);
            const condition = this.ParseExpression();
            const thenStatement = this.ParseScope();
            let elseToken = null;
            let elseStatement = null;
            if (this.Current.Kind === Langite.TokenKind.ElseKeyword) {
                elseToken = this.NextToken();
                if (this.Current.Kind === Langite.TokenKind.IfKeyword) {
                    elseStatement = this.ParseIf();
                }
                else {
                    elseStatement = this.ParseScope();
                }
            }
            return new Langite.AstIf(ifToken, condition, thenStatement, elseToken, elseStatement);
        }
        ParseExpression() {
            return this.ParseBinaryExpression(0);
        }
        ParseLeastExpression() {
            return this.ParseBinaryExpression(Number.POSITIVE_INFINITY);
        }
        ParseBinaryExpression(parentPrecedence) {
            function GetUnaryOperatorPrecedence(kind) {
                switch (kind) {
                    case Langite.TokenKind.Plus:
                    case Langite.TokenKind.Minus:
                    case Langite.TokenKind.ExclamationMark:
                        return 4;
                    default:
                        return 0;
                }
            }
            function GetBinaryOperatorPrecedence(kind) {
                switch (kind) {
                    case Langite.TokenKind.Asterisk:
                    case Langite.TokenKind.Slash:
                    case Langite.TokenKind.Percent:
                        return 3;
                    case Langite.TokenKind.Plus:
                    case Langite.TokenKind.Minus:
                        return 2;
                    case Langite.TokenKind.LessThan:
                    case Langite.TokenKind.GreaterThan:
                    case Langite.TokenKind.LessThanEqual:
                    case Langite.TokenKind.GreaterThanEqual:
                    case Langite.TokenKind.EqualEqual:
                    case Langite.TokenKind.ExclamationMarkEqual:
                        return 1;
                    default:
                        return 0;
                }
            }
            let left;
            const unaryPrecedence = GetUnaryOperatorPrecedence(this.Current.Kind);
            if (unaryPrecedence > 0) {
                const operatorToken = this.NextToken();
                const operand = this.ParseBinaryExpression(unaryPrecedence);
                left = new Langite.AstUnary(operatorToken, operand);
            }
            else {
                left = this.ParsePrimaryExpression();
            }
            while (true) {
                switch (this.Current.Kind) {
                    case Langite.TokenKind.OpenParenthesis:
                        {
                            const openParenthesisToken = this.ExpectToken(Langite.TokenKind.OpenParenthesis);
                            const arguments_ = [];
                            while (this.Current.Kind !== Langite.TokenKind.CloseParenthesis) {
                                arguments_.push(this.ParseExpression());
                                if (this.Current.Kind === Langite.TokenKind.CloseParenthesis)
                                    break;
                                this.ExpectNewlineOrAndComma();
                            }
                            const closeParenthesisToken = this.ExpectToken(Langite.TokenKind.CloseParenthesis);
                            left = new Langite.AstCall(left, openParenthesisToken, arguments_, closeParenthesisToken);
                        }
                        continue;
                    default:
                        {
                            const binaryPrecedence = GetBinaryOperatorPrecedence(this.Current.Kind);
                            if (binaryPrecedence <= parentPrecedence)
                                break;
                            const operatorToken = this.NextToken();
                            const right = this.ParseBinaryExpression(binaryPrecedence);
                            left = new Langite.AstBinary(left, operatorToken, right);
                        }
                        continue;
                }
                break;
            }
            return left;
        }
        ParsePrimaryExpression() {
            switch (this.Current.Kind) {
                case Langite.TokenKind.Name: {
                    const name = this.ExpectToken(Langite.TokenKind.Name);
                    return new Langite.AstName(name);
                }
                case Langite.TokenKind.Integer: {
                    const integer = this.ExpectToken(Langite.TokenKind.Integer);
                    return new Langite.AstInteger(integer);
                }
                case Langite.TokenKind.Float: {
                    const float = this.ExpectToken(Langite.TokenKind.Float);
                    return new Langite.AstFloat(float);
                }
                case Langite.TokenKind.OpenParenthesis: {
                    this.ExpectToken(Langite.TokenKind.OpenParenthesis);
                    const expression = this.ParseExpression();
                    this.ExpectToken(Langite.TokenKind.CloseParenthesis);
                    return expression;
                }
                case Langite.TokenKind.FuncKeyword: {
                    const funcToken = this.ExpectToken(Langite.TokenKind.FuncKeyword);
                    const openParenthesisToken = this.ExpectToken(Langite.TokenKind.OpenParenthesis);
                    const parameters = [];
                    this.AllowNewline();
                    while (this.Current.Kind !== Langite.TokenKind.CloseParenthesis) {
                        const nameToken = this.ExpectToken(Langite.TokenKind.Name);
                        const colonToken = this.ExpectToken(Langite.TokenKind.Colon);
                        const type = this.ParseExpression();
                        parameters.push(new Langite.AstDeclaration(nameToken, colonToken, type, null, null));
                        if (this.Current.Kind === Langite.TokenKind.CloseParenthesis)
                            break;
                        this.ExpectNewlineOrAndComma();
                    }
                    const closeParenthesisToken = this.ExpectToken(Langite.TokenKind.CloseParenthesis);
                    const rightArrowToken = this.ExpectToken(Langite.TokenKind.RightArrow);
                    this.AllowNewline();
                    const returnType = this.ParseLeastExpression();
                    let body = null;
                    if (this.Current.Kind === Langite.TokenKind.OpenBrace) {
                        body = this.ParseScope();
                    }
                    return new Langite.AstFunction(funcToken, openParenthesisToken, parameters, closeParenthesisToken, rightArrowToken, returnType, body);
                }
                case Langite.TokenKind.ProcKeyword: {
                    const procToken = this.ExpectToken(Langite.TokenKind.ProcKeyword);
                    const openParenthesisToken = this.ExpectToken(Langite.TokenKind.OpenParenthesis);
                    const parameters = [];
                    this.AllowNewline();
                    while (this.Current.Kind !== Langite.TokenKind.CloseParenthesis) {
                        const nameToken = this.ExpectToken(Langite.TokenKind.Name);
                        const colonToken = this.ExpectToken(Langite.TokenKind.Colon);
                        const type = this.ParseExpression();
                        parameters.push(new Langite.AstDeclaration(nameToken, colonToken, type, null, null));
                        if (this.Current.Kind === Langite.TokenKind.CloseParenthesis)
                            break;
                        this.ExpectNewlineOrAndComma();
                    }
                    const closeParenthesisToken = this.ExpectToken(Langite.TokenKind.CloseParenthesis);
                    const rightArrowToken = this.ExpectToken(Langite.TokenKind.RightArrow);
                    this.AllowNewline();
                    const returnType = this.ParseLeastExpression();
                    let body = null;
                    if (this.Current.Kind === Langite.TokenKind.OpenBrace) {
                        body = this.ParseScope();
                    }
                    return new Langite.AstProcedure(procToken, openParenthesisToken, parameters, closeParenthesisToken, rightArrowToken, returnType, body);
                }
                default: {
                    const token = this.NextToken();
                    throw new Langite.UnexpectedToken(token);
                }
            }
        }
        NextToken() {
            const current = this.Current;
            this.Current = this.Lexer.NextToken();
            return current;
        }
        ExpectToken(kind) {
            const token = this.NextToken();
            if (token.Kind !== kind)
                throw new Langite.ExpectedToken(kind, token);
            return token;
        }
        AllowNewline() {
            if (this.Current.Kind === Langite.TokenKind.Newline)
                this.NextToken();
        }
        AllowMultipleNewlines() {
            while (this.Current.Kind === Langite.TokenKind.Newline)
                this.NextToken();
        }
        ExpectNewlineOrAndComma() {
            const token = this.NextToken();
            if (token.Kind === Langite.TokenKind.Comma)
                this.AllowNewline();
            else if (token.Kind !== Langite.TokenKind.Newline)
                throw new Langite.ExpectedToken(Langite.TokenKind.Comma, token);
        }
        ExpectNewline() {
            const token = this.NextToken();
            if (token.Kind !== Langite.TokenKind.Newline &&
                token.Kind !== Langite.TokenKind.EndOfFile &&
                token.Kind !== Langite.TokenKind.CloseBrace &&
                token.Kind !== Langite.TokenKind.CloseParenthesis)
                throw new Langite.ExpectedNewline(token);
            return token;
        }
    }
    Langite.Parser = Parser;
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
function PrintAst(filepath, source) {
    try {
        const parser = new Langite.Parser(filepath, source);
        const file = parser.ParseFile();
        return file.Print(0);
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
    const Example = document.getElementById("example");
    const CodeInput = document.getElementById("code_input");
    const Output = document.getElementById("output");
    const ShowTokens = document.getElementById("show_tokens");
    const ShowAst = document.getElementById("show_ast");
    const loadedData = window.localStorage.getItem(SaveKey);
    if (loadedData !== null) {
        CodeInput.value = loadedData;
        ResizeTextArea(CodeInput);
    }
    Example.addEventListener('click', () => {
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
    ShowTokens.addEventListener('click', () => {
        Output.value = PrintTokens("unknown.langite", CodeInput.value);
        ResizeTextArea(CodeInput);
        ResizeTextArea(Output);
    });
    ShowAst.addEventListener('click', () => {
        Output.value = PrintAst("unknown.langite", CodeInput.value);
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