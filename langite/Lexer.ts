/// <reference path="./SourceLocation.ts"/>
/// <reference path="./Token.ts"/>
/// <reference path="./Error.ts"/>

namespace Langite {

    const SingleCharacters: { [character: string]: TokenKind } = {
        '\0': TokenKind.EndOfFile,
        '\n': TokenKind.Newline,
        '\r': TokenKind.Newline,
    };
    const DoubleCharacters: { [first_character: string]: { [second_character: string]: TokenKind } } = {
        '\r': { '\n': TokenKind.Newline },
        '\n': { '\r': TokenKind.Newline },
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

                if (this.Current().match(/ |\r|\v|\f/)) {
                    this.NextChar();
                    continue;
                }

                if (this.Current().match(/\w/)) {
                    let name = "";
                    while (this.Current().match(/\w|\d|\_/)) {
                        name += this.NextChar();
                    }
                    return new Token(TokenKind.Name, startLocation, this.Location.Position - startLocation.Position, name);
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
