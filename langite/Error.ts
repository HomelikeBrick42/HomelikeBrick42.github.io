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

        public GetLocation(): SourceLocation {
            return this.Location;
        }

        public GetMessage(): string {
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

        public GetLocation(): SourceLocation {
            return this.Location;
        }

        public GetMessage(): string {
            return `${this.Location}: Error: Unexpected character '${this.Character}'`;
        }
    }

}
