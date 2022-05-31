/// <reference path="./SourceLocation.ts"/>
/// <reference path="./Token.ts"/>

namespace Langite {

    export enum AstKind {
        File = "File",
        Declaration = "Declaration",
        Name = "Name",
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

}
