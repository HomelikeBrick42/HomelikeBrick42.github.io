/// <reference path="./SourceLocation.ts"/>
/// <reference path="./Token.ts"/>
/// <reference path="./Error.ts"/>

namespace Langite {

    const Keywords: { [name: string]: TokenKind } = {
        "proc": TokenKind.ProcKeyword,
        "func": TokenKind.FuncKeyword,
        "return": TokenKind.ReturnKeyword,
        "if": TokenKind.IfKeyword,
        "else": TokenKind.ElseKeyword,
        "while": TokenKind.WhileKeyword,
    };

    const SingleCharacters: { [character: string]: TokenKind } = {
        '\0': TokenKind.EndOfFile,
        '\n': TokenKind.Newline,
        '\r': TokenKind.Newline,
        '(': TokenKind.OpenParenthesis,
        ')': TokenKind.CloseParenthesis,
        '{': TokenKind.OpenBrace,
        '}': TokenKind.CloseBrace,
        '+': TokenKind.Plus,
        '-': TokenKind.Minus,
        '*': TokenKind.Asterisk,
        '/': TokenKind.Slash,
        '%': TokenKind.Percent,
        ':': TokenKind.Colon,
        ',': TokenKind.Comma,
        '=': TokenKind.Equal,
        '!': TokenKind.ExclamationMark,
        '<': TokenKind.LessThan,
        '>': TokenKind.GreaterThan,
    };

    const DoubleCharacters: { [first_character: string]: { [second_character: string]: TokenKind } } = {
        '\r': { '\n': TokenKind.Newline },
        '\n': { '\r': TokenKind.Newline },
        '=': { '=': TokenKind.EqualEqual },
        '!': { '=': TokenKind.ExclamationMarkEqual },
        '<': { '=': TokenKind.LessThanEqual, '-': TokenKind.LeftArrow },
        '>': { '=': TokenKind.GreaterThanEqual },
        '-': { '>': TokenKind.RightArrow },
    };

    export type char = string;

    export class Lexer {
        private Location: SourceLocation;

        public constructor(filepath: string, source: string) {
            this.Location = new SourceLocation(
                filepath,
                source,
                0,
                1,
                1,
            );
        }

        public NextToken(): Token {
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
                        return new Token(Keywords[name], startLocation, this.Location.Position - startLocation.Position);
                    }
                    return new Token(TokenKind.Name, startLocation, this.Location.Position - startLocation.Position, name);
                }

                // TODO: this needs to be improved alot
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
                        return new Token(TokenKind.Integer, startLocation, this.Location.Position - startLocation.Position, float);
                    }
                    const integer = parseInt(number);
                    return new Token(TokenKind.Integer, startLocation, this.Location.Position - startLocation.Position, integer);
                }

                const char = this.NextChar();

                if (DoubleCharacters[char] !== undefined && DoubleCharacters[char][this.Current()] !== undefined) {
                    const second_char = this.NextChar();
                    return new Token(DoubleCharacters[char][second_char], startLocation, this.Location.Position - startLocation.Position);
                }

                if (SingleCharacters[char] !== undefined)
                    return new Token(SingleCharacters[char], startLocation, this.Location.Position - startLocation.Position);

                throw new UnexpectedCharacter(startLocation, char);
            }
        }

        private Current(): char {
            if (this.Location.Position < this.Location.Source.length)
                return this.Location.Source[this.Location.Position];
            return '\0';
        }

        private NextChar(): char {
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

}
