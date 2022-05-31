namespace Langite {

    export abstract class Error {
        public abstract GetLocation(): SourceLocation;
        public abstract GetMessage(): string;
    }

    export class Unimplemented extends Error {
        public Location: SourceLocation;
        public Message: string;

        public constructor(location: SourceLocation, message: string) {
            super();
            this.Location = location;
            this.Message = message;
        }

        public override GetLocation(): SourceLocation {
            return this.Location;
        }

        public override GetMessage(): string {
            return `${this.Location}: ${this.Message}`;
        }
    }

    export class UnexpectedCharacter extends Error {
        public Location: SourceLocation;
        public Character: char;

        public constructor(location: SourceLocation, character: char) {
            super();
            this.Location = location;
            this.Character = character;
        }

        public override GetLocation(): SourceLocation {
            return this.Location;
        }

        public override GetMessage(): string {
            return `${this.Location}: Error: Unexpected character '${this.Character}'`;
        }
    }

    export class UnexpectedToken extends Error {
        public Token: Token;

        public constructor(token: Token) {
            super();
            this.Token = token;
        }

        public override GetLocation(): SourceLocation {
            return this.Token.Location;
        }

        public override GetMessage(): string {
            return `${this.Token.Location}: Error: Unexpected token '${this.Token.Kind}'`;
        }
    }

    export class ExpectedToken extends Error {
        public ExpectedKind: TokenKind;
        public GotToken: Token;

        public constructor(expectedKind: TokenKind, gotToken: Token) {
            super();
            this.ExpectedKind = expectedKind;
            this.GotToken = gotToken;
        }

        public override GetLocation(): SourceLocation {
            return this.GotToken.Location;
        }

        public override GetMessage(): string {
            return `${this.GotToken.Location}: Error: Expected '${this.ExpectedKind}' but got '${this.GotToken.Kind}'`;
        }
    }

    export class ExpectedNewline extends Error {
        public GotToken: Token;

        public constructor(gotToken: Token) {
            super();
            this.GotToken = gotToken;
        }

        public override GetLocation(): SourceLocation {
            return this.GotToken.Location;
        }

        public override GetMessage(): string {
            return `${this.GotToken.Location}: Error: Expected a newline but got '${this.GotToken.Kind}'`;
        }
    }

}
