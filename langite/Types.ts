/// <reference path="Ast.ts"/>

namespace Langite {

    export enum TypeKind {
        Integer = "Integer Type",
        Float = "Float Type",
        Function = "Function Type",
        Procedure = "Procedure Type",
    }

    export abstract class Type {
        public abstract Kind: TypeKind;
        public abstract IsEqual(other: Type): boolean;
        public abstract Print(indent: number): string;
    }

    function PrintHeader(indent: number, type: Type): string {
        return `${GetIndent(indent)}- ${type.Kind}\n`;
    }

    export class TypeInteger extends Type {
        public Kind = TypeKind.Integer;
        public Signed: boolean;

        public constructor(signed: boolean) {
            super();
            this.Signed = signed;
        }

        public IsEqual(other: Type): boolean {
            if (other.Kind !== this.Kind)
                return false;
            const otherType = other as TypeInteger;
            if (this.Signed !== otherType.Signed)
                return false;
            return true;
        }

        public Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Signed: ${this.Signed}\n`;
            return result;
        }
    }

    export class TypeFloat extends Type {
        public Kind = TypeKind.Float;

        public constructor() {
            super();
        }

        public IsEqual(other: Type): boolean {
            if (other.Kind !== this.Kind)
                return false;
            return true;
        }

        public Print(indent: number): string {
            let result = PrintHeader(indent, this);
            return result;
        }
    }

    export class TypeFunction extends Type {
        public Kind = TypeKind.Function;
        public Parameters: Type[];
        public ReturnType: Type;

        public constructor(parameters: Type[], returnType: Type) {
            super();
            this.Parameters = parameters;
            this.ReturnType = returnType;
        }

        public IsEqual(other: Type): boolean {
            if (other.Kind !== this.Kind)
                return false;
            const otherType = other as TypeFunction;
            if (!this.ReturnType.IsEqual(otherType.ReturnType))
                return false;
            if (this.Parameters.length !== otherType.Parameters.length)
                return false;
            for (let i = 0; i < this.Parameters.length; i++) {
                if (!this.Parameters[i].IsEqual(otherType.Parameters[i]))
                    return false;
            }
            return true;
        }

        public Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Parameters:\n`;
            this.Parameters.forEach((parameter) => {
                result += parameter.Print(indent + 2);
            });
            result += `${GetIndent(indent + 1)}Return Type:`;
            result += this.ReturnType.Print(indent + 2);
            return result;
        }
    }

    export class TypeProcedure extends Type {
        public Kind = TypeKind.Procedure;
        public Parameters: Type[];
        public ReturnType: Type;

        public constructor(parameters: Type[], returnType: Type) {
            super();
            this.Parameters = parameters;
            this.ReturnType = returnType;
        }

        public IsEqual(other: Type): boolean {
            if (other.Kind !== this.Kind)
                return false;
            const otherType = other as TypeFunction;
            if (!this.ReturnType.IsEqual(otherType.ReturnType))
                return false;
            if (this.Parameters.length !== otherType.Parameters.length)
                return false;
            for (let i = 0; i < this.Parameters.length; i++) {
                if (!this.Parameters[i].IsEqual(otherType.Parameters[i]))
                    return false;
            }
            return true;
        }

        public Print(indent: number): string {
            let result = PrintHeader(indent, this);
            result += `${GetIndent(indent + 1)}Parameters:\n`;
            this.Parameters.forEach((parameter) => {
                result += parameter.Print(indent + 2);
            });
            result += `${GetIndent(indent + 1)}Return Type:`;
            result += this.ReturnType.Print(indent + 2);
            return result;
        }
    }

}
