/// <reference path="./SourceLocation.ts"/>

namespace Langite {

    export enum TokenKind {
        EndOfFile = "EOF",
        Newline = "Newline",
        Name = "Name",
        Integer = "Integer",
        Float = "Float",
        OpenParenthesis = "(",
        CloseParenthesis = ")",
        OpenBrace = "{",
        CloseBrace = "}",
        Plus = "+",
        Minus = "-",
        Asterisk = "*",
        Slash = "/",
        Percent = "%",
        Colon = ":",
        Comma = ",",
        Equal = "=",
        EqualEqual = "==",
        ExclamationMark = "!",
        ExclamationMarkEqual = "!=",
        LessThan = "<",
        GreaterThan = ">",
        LessThanEqual = "<=",
        GreaterThanEqual = ">=",
        LeftArrow = "<-",
        RightArrow = "->",
        ProcKeyword = "proc",
        FuncKeyword = "func",
        ReturnKeyword = "return",
        IfKeyword = "if",
        ElseKeyword = "else",
        WhileKeyword = "while",
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
