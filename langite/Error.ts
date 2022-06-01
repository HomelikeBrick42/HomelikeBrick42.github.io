namespace Langite {

    export abstract class Error {
        public abstract get Location(): SourceLocation;
        public abstract get Message(): string;
    }

    export class Unimplemented extends Error {
        public UnimplementedLocation: SourceLocation;
        public UnimplementedMessage: string;

        public constructor(location: SourceLocation, message: string) {
            super();
            this.UnimplementedLocation = location;
            this.UnimplementedMessage = message;
        }

        public override get Location(): SourceLocation {
            return this.UnimplementedLocation;
        }

        public override get Message(): string {
            return `${this.UnimplementedLocation}: ${this.UnimplementedMessage}`;
        }
    }

    export class UnexpectedCharacter extends Error {
        public CharacterLocation: SourceLocation;
        public Character: char;

        public constructor(characterLocation: SourceLocation, character: char) {
            super();
            this.CharacterLocation = characterLocation;
            this.Character = character;
        }

        public override get Location(): SourceLocation {
            return this.CharacterLocation;
        }

        public override get Message(): string {
            return `${this.CharacterLocation}: Error: Unexpected character '${this.Character}'`;
        }
    }

    export class UnexpectedToken extends Error {
        public Token: Token;

        public constructor(token: Token) {
            super();
            this.Token = token;
        }

        public override get Location(): SourceLocation {
            return this.Token.Location;
        }

        public override get Message(): string {
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

        public override get Location(): SourceLocation {
            return this.GotToken.Location;
        }

        public override get Message(): string {
            return `${this.GotToken.Location}: Error: Expected '${this.ExpectedKind}' but got '${this.GotToken.Kind}'`;
        }
    }

    export class ExpectedNewline extends Error {
        public GotToken: Token;

        public constructor(gotToken: Token) {
            super();
            this.GotToken = gotToken;
        }

        public override get Location(): SourceLocation {
            return this.GotToken.Location;
        }

        public override get Message(): string {
            return `${this.GotToken.Location}: Error: Expected a newline but got '${this.GotToken.Kind}'`;
        }
    }

}
