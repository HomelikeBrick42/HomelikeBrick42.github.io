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
            switch (this.Current.Kind) {
                case TokenKind.OpenBrace:
                    return this.ParseScope();

                case TokenKind.ReturnKeyword: {
                    const returnToken = this.ExpectToken(TokenKind.ReturnKeyword);
                    let value: Ast | null = null;
                    // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                    if (this.Current.Kind !== TokenKind.Newline &&
                        // @ts-ignore
                        this.Current.Kind !== TokenKind.EndOfFile &&
                        // @ts-ignore
                        this.Current.Kind !== TokenKind.CloseBrace &&
                        // @ts-ignore
                        this.Current.Kind !== TokenKind.CloseParenthesis) {
                        value = this.ParseExpression();
                    }
                    return new AstReturn(returnToken, value);
                }

                default: {
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
            }
        }

        private ParseScope(): AstScope {
            const openBraceToken = this.ExpectToken(TokenKind.OpenBrace);
            const statements: Ast[] = [];
            while (this.Current.Kind !== TokenKind.CloseBrace) {
                this.AllowMultipleNewlines();

                // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                if (this.Current.Kind === TokenKind.EndOfFile)
                    break;

                statements.push(this.ParseStatement());
                this.ExpectNewline();
            }
            const closeBraceToken = this.ExpectToken(TokenKind.CloseBrace);
            return new AstScope(openBraceToken, statements, closeBraceToken);
        }

        public ParseExpression(): Ast {
            return this.ParseBinaryExpression(0);
        }

        public ParseLeastExpression(): Ast {
            return this.ParseBinaryExpression(Number.POSITIVE_INFINITY);
        }

        private ParseBinaryExpression(parentPrecedence: number): Ast {
            throw new Unimplemented(this.Current.Location, "`ParseBinaryExpression` is not implemented");
        }

        private ParsePrimaryExpression(): Ast {
            switch (this.Current.Kind) {
                case TokenKind.Name: {
                    const name = this.ExpectToken(TokenKind.Name);
                    return new AstName(name);
                }

                case TokenKind.Integer: {
                    const integer = this.ExpectToken(TokenKind.Integer);
                    return new AstInteger(integer);
                }

                case TokenKind.Float: {
                    const float = this.ExpectToken(TokenKind.Float);
                    return new AstFloat(float);
                }

                case TokenKind.OpenParenthesis: {
                    this.ExpectToken(TokenKind.OpenParenthesis);
                    const expression = this.ParseExpression();
                    this.ExpectToken(TokenKind.CloseParenthesis);
                    return expression;
                }

                case TokenKind.FuncKeyword: {
                    const funcToken = this.ExpectToken(TokenKind.FuncKeyword);
                    const openParenthesisToken = this.ExpectToken(TokenKind.OpenParenthesis);
                    const parameters: AstDeclaration[] = [];
                    this.AllowNewline();
                    // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                    while (this.Current.Kind !== TokenKind.CloseParenthesis) {
                        const nameToken = this.ExpectToken(TokenKind.Name);
                        const colonToken = this.ExpectToken(TokenKind.Colon);
                        const type = this.ParseExpression();
                        parameters.push(new AstDeclaration(nameToken, colonToken, type, null, null));
                        // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                        if (this.Current.Kind === TokenKind.CloseParenthesis)
                            break;
                        this.ExpectNewlineOrAndComma();
                    }
                    const closeParenthesisToken = this.ExpectToken(TokenKind.CloseParenthesis);
                    const rightArrowToken = this.ExpectToken(TokenKind.RightArrow);
                    this.AllowNewline();
                    const returnType = this.ParseLeastExpression();
                    let body: AstScope | null = null;
                    // @ts-ignore: again the compiler being dumb and not checking for side effects inside member functions
                    if (this.Current.Kind === TokenKind.OpenBrace) {
                        body = this.ParseScope();
                    }
                    return new AstFunction(funcToken, openParenthesisToken, parameters, closeParenthesisToken, rightArrowToken, returnType, body);
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

        private ExpectNewlineOrAndComma(): void {
            const token = this.NextToken();
            if (token.Kind === TokenKind.Comma)
                this.AllowNewline();
            else if (token.Kind !== TokenKind.Newline)
                throw new ExpectedToken(TokenKind.Comma, token);
        }

        private ExpectNewline(): Token {
            const token = this.NextToken();
            if (token.Kind !== TokenKind.Newline &&
                token.Kind !== TokenKind.EndOfFile &&
                token.Kind !== TokenKind.CloseBrace &&
                token.Kind !== TokenKind.CloseParenthesis)
                throw new ExpectedNewline(token);
            return token;
        }
    }

}
