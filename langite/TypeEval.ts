namespace Langite {

    export function EvalType(ast: Ast): Type {
        switch (ast.Kind) {
            case AstKind.Name: {
                const name = ast as AstName;
                return EvalType(name.ResolvedDeclaration?.Value as Ast);
            }

            case AstKind.Builtin: {
                const builtin = ast as AstBuiltin;
                switch (builtin.BuiltinKind) {
                    case AstBuiltinKind.Void:
                        return new TypeVoid();
                    case AstBuiltinKind.Type:
                        return new TypeType();
                    case AstBuiltinKind.Bool:
                        return new TypeType();
                    case AstBuiltinKind.Int:
                        return new TypeInteger(true);
                    case AstBuiltinKind.UInt:
                        return new TypeInteger(false);
                    case AstBuiltinKind.Float:
                        return new TypeFloat();
                    default:
                        throw new Unimplemented(builtin.Location, `'ResolveTypes' builtin is not implemented for ${builtin.BuiltinKind}`);
                }
            }

            default:
                throw new Unimplemented(ast.Location, `'EvalType' is not implemented for ${ast.Kind}`);
        }
    }

}
