/// <reference path="./SourceLocation.ts"/>
/// <reference path="./Token.ts"/>

namespace Langite {

    export enum AstKind {
        File = "File",
        Scope = "Scope",
        Declaration = "Declaration",
        Name = "Name",
        Integer = "Integer",
        Float = "Float",
        Unary = "Unary",
        Binary = "Binary",
        Function = "Function",
        Return = "Return",
    }

    export abstract class Ast {
        public abstract Kind: AstKind;
        public abstract GetLocation(): SourceLocation;
        public abstract Print(indent: number): string;
    }

    function GetIndent(indent: number): string {
        let result = "";
        for (let i = 0; i < indent; i++) {
            result += "  ";
        }
        return result;
    }

    function PrintHeader(indent: number, ast: Ast): string {
        return `${GetIndent(indent)}- ${ast.Kind}\n`;
    }

    export class AstFile extends Ast {
        public Kind = AstKind.File;
        public Statements: Ast[];
        public EndOfFileToken: Token;

        public constructor(statements: Ast[], endOfFileToken: Token) {
            super();
            this.Statements = statements;
            this.EndOfFileToken = endOfFileToken;
        }

        public override GetLocation(): SourceLocation {
            const location = this.EndOfFileToken.Location.Clone();
            location.Position = 0;
            location.Line = 1;
            location.Column = 1;
            return location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Statements:\n`;
            this.Statements.forEach((statement) => {
                result += statement.Print(indent + 2);
            });
            return result;
        }
    }

    export class AstScope extends Ast {
        public Kind = AstKind.Scope;
        public OpenBraceToken: Token;
        public Statements: Ast[];
        public CloseBraceToken: Token;

        public constructor(openBraceToken: Token, statements: Ast[], closeBraceToken: Token) {
            super();
            this.OpenBraceToken = openBraceToken;
            this.Statements = statements;
            this.CloseBraceToken = closeBraceToken;
        }

        public override GetLocation(): SourceLocation {
            return this.OpenBraceToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Statements:\n`;
            this.Statements.forEach((statement) => {
                result += statement.Print(indent + 2);
            });
            return result;
        }
    }

    export class AstDeclaration extends Ast {
        public Kind = AstKind.Declaration;
        public NameToken: Token;
        public ColonToken: Token;
        public Type: Ast | null;
        public ColonOrEqualToken: Token | null;
        public Value: Ast | null;

        public constructor(nameToken: Token, colonToken: Token, type: Ast | null, colonOrEqualToken: Token | null, value: Ast | null) {
            super();
            this.NameToken = nameToken;
            this.ColonToken = colonToken;
            this.Type = type;
            this.ColonOrEqualToken = colonOrEqualToken;
            this.Value = value;
        }

        public get IsConstant(): boolean {
            return this.ColonOrEqualToken !== null && this.ColonOrEqualToken.Kind == TokenKind.Colon;
        }

        public override GetLocation(): SourceLocation {
            return this.NameToken.Location;
        }

        public override Print(indent: number): string {
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

    export class AstName extends Ast {
        public Kind = AstKind.Name;
        public NameToken: Token;

        public constructor(nameToken: Token) {
            super();
            this.NameToken = nameToken;
        }

        public override GetLocation(): SourceLocation {
            return this.NameToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.NameToken.Value}'\n`;
            return result;
        }
    }

    export class AstInteger extends Ast {
        public Kind = AstKind.Integer;
        public IntegerToken: Token;

        public constructor(integerToken: Token) {
            super();
            this.IntegerToken = integerToken;
        }

        public override GetLocation(): SourceLocation {
            return this.IntegerToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.IntegerToken.Value}'\n`;
            return result;
        }
    }

    export class AstFloat extends Ast {
        public Kind = AstKind.Float;
        public FloatToken: Token;

        public constructor(floatToken: Token) {
            super();
            this.FloatToken = floatToken;
        }

        public override GetLocation(): SourceLocation {
            return this.FloatToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Value: '${this.FloatToken.Value}'\n`;
            return result;
        }
    }

    export class AstUnary extends Ast {
        public Kind = AstKind.Unary;
        public OperatorToken: Token;
        public Operand: Ast;

        public constructor(operatorToken: Token, operand: Ast) {
            super();
            this.OperatorToken = operatorToken;
            this.Operand = operand;
        }

        public override GetLocation(): SourceLocation {
            return this.OperatorToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}OperatorToken: '${this.OperatorToken.Kind}'\n`;
            result += `${GetIndent(indent + 1)}Operand:\n`;
            result += this.Operand.Print(indent + 2);
            return result;
        }
    }

    export class AstBinary extends Ast {
        public Kind = AstKind.Binary;
        public Left: Ast;
        public OperatorToken: Token;
        public Right: Ast;

        public constructor(left: Ast, operatorToken: Token, right: Ast) {
            super();
            this.Left = left;
            this.OperatorToken = operatorToken;
            this.Right = right;
        }

        public override GetLocation(): SourceLocation {
            return this.OperatorToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}OperatorToken: '${this.OperatorToken.Kind}'\n`;
            result += `${GetIndent(indent + 1)}Left:\n`;
            result += this.Left.Print(indent + 2);
            result += `${GetIndent(indent + 1)}Right:\n`;
            result += this.Right.Print(indent + 2);
            return result;
        }
    }

    export class AstFunction extends Ast {
        public Kind = AstKind.Function;
        public FuncToken: Token;
        public OpenParenthesisToken: Token;
        public Parameters: AstDeclaration[];
        public CloseParenthesisToken: Token;
        public RightArrowToken: Token;
        public ReturnType: Ast;
        public Body: AstScope | null;

        public constructor(funcToken: Token, openParenthesisToken: Token, parameters: AstDeclaration[], closeParenthesisToken: Token, rightArrowToken: Token, returnType: Ast, body: AstScope | null) {
            super();
            this.FuncToken = funcToken;
            this.OpenParenthesisToken = openParenthesisToken;
            this.Parameters = parameters;
            this.CloseParenthesisToken = closeParenthesisToken;
            this.RightArrowToken = rightArrowToken;
            this.ReturnType = returnType;
            this.Body = body;
        }

        public override GetLocation(): SourceLocation {
            return this.FuncToken.Location;
        }

        public override Print(indent: number): string {
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

    export class AstReturn extends Ast {
        public Kind = AstKind.Return;
        public ReturnToken: Token;
        public Value: Ast | null;

        public constructor(returnToken: Token, value: Ast | null) {
            super();
            this.ReturnToken = returnToken;
            this.Value = value;
        }

        public override GetLocation(): SourceLocation {
            return this.ReturnToken.Location;
        }

        public override Print(indent: number): string {
            let result = PrintHeader(indent, this);
            if (this.Value !== null) {
                result += `${GetIndent(indent + 1)}Value:\n`;
                result += this.Value.Print(indent + 2);
            }
            return result;
        }
    }

}
