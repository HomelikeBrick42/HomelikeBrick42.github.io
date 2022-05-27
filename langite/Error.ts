namespace Langite {

    export abstract class Error {
        public abstract GetLocation(): SourceLocation;
        public abstract GetMessage(): string;
    }

    export class UnexpectedCharacter extends Error {
        public Location: SourceLocation;
        public Character: char;

        public constructor(location: SourceLocation, character: char) {
            super()
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
