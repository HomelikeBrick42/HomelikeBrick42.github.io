/// <reference path="./Token.ts"/>
/// <reference path="./Ast.ts"/>
/// <reference path="./Error.ts"/>
/// <reference path="./Lexer.ts"/>

namespace Langite {

    export class Parser {
        private Lexer: Lexer;
        public Current: Token;

        public constructor(filepath: string, source: string) {
            this.Lexer = new Lexer(filepath, source);
            this.Current = this.Lexer.NextToken();
        }

        public ParseFile(): AstFile {
            const statements: Ast[] = [];
            while (this.Current.Kind !== TokenKind.EndOfFile) {
                this.AllowMultipleNewlines();

                // @ts-ignore: the compiler is straight up wrong here
                // it is not seeing that this.AllowMultipleNewlines() reassigns this.Current
                // so it thinks that this `if` is redundunt when it is not
                if (this.Current.Kind === TokenKind.EndOfFile)
                    break;

                statements.push(this.ParseStatement());
                this.ExpectNewline();
            }
            const endOfFileToken = this.NextToken();
            return new AstFile(statements, endOfFileToken);
        }

        public ParseStatement(): Ast {
            const expression = this.ParseExpression();
            if (expression.Kind === AstKind.Name && this.Current.Kind === TokenKind.Colon) {
                const name = expression as AstName;
                const colonToken = this.ExpectToken(TokenKind.Colon);

                let type: Ast | null = null;
                // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                if (this.Current.Kind !== TokenKind.Equal && this.Current.Kind !== TokenKind.Colon) {
                    type = this.ParseExpression();
                }

                let colonOrEqualToken: Token | null = null;
                let value: Ast | null = null;
                // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                if (this.Current.Kind === TokenKind.Equal || this.Current.Kind === TokenKind.Colon) {
                    colonOrEqualToken = this.NextToken();
                    value = this.ParseExpression();
                }

                return new AstDeclaration(name.NameToken, colonToken, type, colonOrEqualToken, value);
            }
            return expression;
        }

        public ParseExpression(): Ast {
            switch (this.Current.Kind) {
                case TokenKind.Name: {
                    const name = this.ExpectToken(TokenKind.Name);
                    return new AstName(name);
                }

                default: {
                    const token = this.NextToken();
                    throw new UnexpectedToken(token);
                }
            }
        }

        private NextToken(): Token {
            const current = this.Current;
            this.Current = this.Lexer.NextToken();
            return current;
        }

        private ExpectToken(kind: TokenKind): Token {
            const token = this.NextToken();
            if (token.Kind !== kind)
                throw new ExpectedToken(kind, token);
            return token;
        }

        private AllowNewline(): void {
            if (this.Current.Kind === TokenKind.Newline)
                this.NextToken();
        }

        private AllowMultipleNewlines(): void {
            while (this.Current.Kind === TokenKind.Newline)
                this.NextToken();
        }

        private ExpectNewline(): Token {
            const token = this.NextToken();
            if (this.Current.Kind !== TokenKind.Newline &&
                this.Current.Kind !== TokenKind.EndOfFile &&
                this.Current.Kind !== TokenKind.CloseBrace)
                throw new ExpectedNewline(token);
            return token;
        }
    }

}
