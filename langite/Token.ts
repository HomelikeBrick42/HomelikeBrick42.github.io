/// <reference path="./SourceLocation.ts"/>

namespace Langite {

    export enum TokenKind {
        EndOfFile = "EOF",
        Name = "Name",
    }

    export type TokenData = number | string | null;

    export class Token {
        public Kind: TokenKind;
        public Location: SourceLocation;
        public Length: number;
        public Value: TokenData;

        public constructor(kind: TokenKind, location: SourceLocation, length: number, value: TokenData = null) {
            this.Kind = kind;
            this.Location = location;
            this.Length = length;
            this.Value = value;
        }
    }

}
