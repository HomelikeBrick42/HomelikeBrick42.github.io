namespace Langite {

    function IsConstant(ast: Ast): boolean {
        switch (ast.Kind) {
            case AstKind.File: {
                return false;
            }

            case AstKind.Block: {
                return false;
            }

            case AstKind.Declaration: {
                const declaration = ast as AstDeclaration;
                return declaration.IsConstant;
            }

            case AstKind.Name: {
                const name = ast as AstName;
                return name.ResolvedDeclaration?.IsConstant as boolean;
            }

            case AstKind.Integer: {
                return true;
            }

            case AstKind.Float: {
                return true;
            }

            case AstKind.Unary: {
                const unary = ast as AstUnary;
                return IsConstant(unary.Operand);
            }

            case AstKind.Binary: {
                const binary = ast as AstBinary;
                return IsConstant(binary.Left) && IsConstant(binary.Right);
            }

            case AstKind.Call: {
                const call = ast as AstCall;
                if (!IsConstant(call.Operand))
                    return false;
                let constant = true;
                call.Arguments.forEach((argument) => {
                    if (!IsConstant(argument))
                        constant = false;
                });
                return constant;
            }

            case AstKind.Function: {
                return true;
            }

            case AstKind.Procedure: {
                return false;
            }

            case AstKind.Return: {
                return false;
            }

            case AstKind.If: {
                return false;
            }

            case AstKind.Builtin: {
                return true;
            }

            default:
                throw new Unimplemented(ast.Location, `'IsConstant' is not implemented for ${ast.Kind}`);
        }
    }

    export function ResolveTypes(ast: Ast, suggestedType: Type | null): void {
        if (ast.ResolvedType !== null)
            return; // already resolved
        switch (ast.Kind) {
            case AstKind.File: {
                const file = ast as AstFile;
                file.ResolvedType = new TypeVoid();
                file.Statements.forEach((statement) => {
                    ResolveTypes(statement, null);
                });
            } break;

            case AstKind.Block: {
                const block = ast as AstBlock;
                block.ResolvedType = new TypeVoid();
                block.Statements.forEach((statement) => {
                    ResolveTypes(statement, null);
                });
            } break;

            case AstKind.Declaration: {
                const declaration = ast as AstDeclaration;
                if (declaration.Type !== null) {
                    ResolveTypes(declaration.Type, new TypeType());
                    if (!declaration.Type.ResolvedType?.IsEqual(new TypeType())) {
                        throw new Unimplemented(declaration.Type.Location, "declaration type not a type error is not implemented");
                    }
                    if (!IsConstant(declaration.Type))
                        throw new ExpectedConstant(declaration.Type);
                    declaration.ResolvedType = EvalType(declaration.Type);
                }
                if (declaration.Value !== null) {
                    ResolveTypes(declaration.Value, declaration.ResolvedType);
                    if (declaration.ResolvedType === null) {
                        declaration.ResolvedType = declaration.Value.ResolvedType;
                    } else {
                        // TODO: check that type is correct
                    }
                    if (declaration.IsConstant && !IsConstant(declaration.Value))
                        throw new ExpectedConstant(declaration.Value);
                }
            } break;

            case AstKind.Name: {
                const name = ast as AstName;
                ResolveTypes(name.ResolvedDeclaration as AstDeclaration, null);
                name.ResolvedType = name.ResolvedDeclaration?.ResolvedType as Type;
            } break;

            case AstKind.Integer: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Float: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Unary: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Binary: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Call: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Function: {
                const function_ = ast as AstFunction;
                function_.Parameters.forEach((parameter) => {
                    ResolveTypes(parameter, null);
                });
                ResolveTypes(function_.ReturnType, new TypeType());
                if (!IsConstant(function_.ReturnType))
                    throw new ExpectedConstant(function_.ReturnType);
                if (function_.Body !== null) {
                    const parameterTypes = function_.Parameters.map((parameter) => parameter.ResolvedType as Type);
                    const returnType = EvalType(function_.ReturnType);
                    function_.ResolvedType = new TypeFunction(parameterTypes, returnType);
                    ResolveTypes(function_.Body, null);
                } else {
                    function_.ResolvedType = new TypeType();
                }
            } break;

            case AstKind.Procedure: {
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Return: {
                const return_ = ast as AstReturn;
                return_.ResolvedType = new TypeVoid();
                if (return_.Value !== null) {
                    ResolveTypes(return_.Value, null); // TODO: get parent procedure for expected type
                    // TODO: check that type is correct
                }
            } break;

            case AstKind.If: {
                const if_ = ast as AstReturn;
                if_.ResolvedType = new TypeVoid();
                throw new Unimplemented(ast.Location, `'${ast.Kind}' is not implemented`);
            } break;

            case AstKind.Builtin: {
                const builtin = ast as AstBuiltin;
                switch (builtin.BuiltinKind) {
                    case AstBuiltinKind.Void: {
                        builtin.ResolvedType = new TypeType();
                    } break;

                    case AstBuiltinKind.Type: {
                        builtin.ResolvedType = new TypeType();
                    } break;

                    case AstBuiltinKind.Bool: {
                        builtin.ResolvedType = new TypeBool();
                    } break;

                    case AstBuiltinKind.Int: {
                        builtin.ResolvedType = new TypeType();
                    } break;

                    case AstBuiltinKind.UInt: {
                        builtin.ResolvedType = new TypeType();
                    } break;

                    case AstBuiltinKind.Float: {
                        builtin.ResolvedType = new TypeType();
                    } break;

                    case AstBuiltinKind.PrintInt: {
                        builtin.ResolvedType = new TypeProcedure([new TypeInteger(true)], new TypeVoid());
                    } break;

                    case AstBuiltinKind.PrintUInt: {
                        builtin.ResolvedType = new TypeProcedure([new TypeInteger(false)], new TypeVoid());
                    } break;

                    case AstBuiltinKind.Println: {
                        builtin.ResolvedType = new TypeProcedure([], new TypeVoid());
                    } break;

                    default:
                        throw new Unimplemented(builtin.Location, `'ResolveTypes' builtin is not implemented for ${builtin.BuiltinKind}`);
                }
            } break;

            default:
                throw new Unimplemented(ast.Location, `'ResolveTypes' is not implemented for ${ast.Kind}`);
        }
        if (ast.ResolvedType === null)
            throw new Unimplemented(ast.Location, `no type assigned for ${ast.Kind}`);
    }

}
