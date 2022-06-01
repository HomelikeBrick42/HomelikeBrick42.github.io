namespace Langite {

    export enum TypeKind {
        Integer = "Integer",
        Float = "Float",
        Function = "Function",
        Procedure = "Procedure",
    }

    export abstract class Type {
        public abstract Kind: TypeKind;
        public abstract IsEqual(other: Type): boolean;
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
    }

}
