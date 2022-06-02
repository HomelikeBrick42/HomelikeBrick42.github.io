/// <reference path="./Ast.ts"/>

namespace Langite {

    type DeclarationMap = { [name: string]: AstDeclaration };

    export function ResolveNames(ast: Ast, declarations: DeclarationMap[], constDeclarations: DeclarationMap[], globalScopeIndex: number): void {
        switch (ast.Kind) {
            case AstKind.File: {
                const file = ast as AstFile;
                declarations.push({});
                constDeclarations.push({});
                file.Statements.forEach((statement) => {
                    ResolveNames(statement, declarations, constDeclarations, globalScopeIndex);
                });
                declarations.pop();
                constDeclarations.pop();
            } break;

            case AstKind.Block: {
                const block = ast as AstBlock;
                declarations.push({});
                constDeclarations.push({});
                block.Statements.forEach((statement) => {
                    ResolveNames(statement, declarations, constDeclarations, globalScopeIndex);
                });
                declarations.pop();
                constDeclarations.pop();
            } break;

            case AstKind.Declaration: {
                const declaration = ast as AstDeclaration;
                const name = declaration.NameToken.Value as string;
                if (declarations[declarations.length - 1][name] !== undefined || constDeclarations[constDeclarations.length - 1][name] !== undefined)
                    throw new Unimplemented(declaration.Location, "redeclaration errors are not implemented");
                if (declaration.Type !== null) {
                    ResolveNames(declaration.Type, declarations, constDeclarations, globalScopeIndex);
                }
                if (declaration.IsConstant) {
                    constDeclarations[constDeclarations.length - 1][name] = declaration;
                    if (declaration.Value !== null) {
                        ResolveNames(declaration.Value, declarations, constDeclarations, globalScopeIndex);
                    }
                } else {
                    if (declaration.Value !== null) {
                        ResolveNames(declaration.Value, declarations, constDeclarations, globalScopeIndex);
                    }
                    declarations[declarations.length - 1][name] = declaration;
                }
            } break;

            case AstKind.Name: {
                const name = ast as AstName;
                const nameString = name.NameToken.Value as string;
                for (let i = 0; i < Math.max(constDeclarations.length, declarations.length); i++) {
                    if (i < constDeclarations.length && constDeclarations[i][nameString] !== undefined) {
                        name.ResolvedDeclaration = constDeclarations[i][nameString];
                    }
                    if (i < declarations.length && declarations[i][nameString] !== undefined) {
                        name.ResolvedDeclaration = declarations[i][nameString];
                    }
                }
                if (name.ResolvedDeclaration === null)
                    throw new NameNotFound(name);
            } break;

            case AstKind.Integer: {
            } break;

            case AstKind.Float: {
            } break;

            case AstKind.Unary: {
                const unary = ast as AstUnary;
                ResolveNames(unary.Operand, declarations, constDeclarations, globalScopeIndex);
            } break;

            case AstKind.Binary: {
                const binary = ast as AstBinary;
                ResolveNames(binary.Left, declarations, constDeclarations, globalScopeIndex);
                ResolveNames(binary.Right, declarations, constDeclarations, globalScopeIndex);
            } break;

            case AstKind.Call: {
                const call = ast as AstCall;
                ResolveNames(call.Operand, declarations, constDeclarations, globalScopeIndex);
                call.Arguments.forEach((argument) => {
                    ResolveNames(argument, declarations, constDeclarations, globalScopeIndex);
                });
            } break;

            case AstKind.Function: {
                const function_ = ast as AstFunction;
                constDeclarations.push({});
                declarations = [{}];
                function_.Parameters.forEach((parameter) => {
                    ResolveNames(parameter, declarations, constDeclarations, globalScopeIndex);
                });
                ResolveNames(function_.ReturnType, declarations, constDeclarations, globalScopeIndex);
                if (function_.Body !== null) {
                    ResolveNames(function_.Body, declarations, constDeclarations, globalScopeIndex);
                }
                constDeclarations.pop();
            } break;

            case AstKind.Procedure: {
                const procedure = ast as AstProcedure;
                constDeclarations.push({});
                declarations = declarations.slice(0, globalScopeIndex + 1);
                declarations.push({});
                procedure.Parameters.forEach((parameter) => {
                    ResolveNames(parameter, declarations, constDeclarations, globalScopeIndex);
                });
                ResolveNames(procedure.ReturnType, declarations, constDeclarations, globalScopeIndex);
                if (procedure.Body !== null) {
                    ResolveNames(procedure.Body, declarations, constDeclarations, globalScopeIndex);
                }
                constDeclarations.pop();
            } break;

            case AstKind.Return: {
                const return_ = ast as AstReturn;
                if (return_.Value !== null) {
                    ResolveNames(return_.Value, declarations, constDeclarations, globalScopeIndex);
                }
            } break;

            case AstKind.If: {
                const if_ = ast as AstIf;
                ResolveNames(if_.Condition, declarations, constDeclarations, globalScopeIndex);
                ResolveNames(if_.ThenStatement, declarations, constDeclarations, globalScopeIndex);
                if (if_.ElseStatement !== null) {
                    ResolveNames(if_.ElseStatement, declarations, constDeclarations, globalScopeIndex);
                }
            } break;

            default:
                throw new Unimplemented(ast.Location, `'ResolveNames' is not implemented for ${ast.Kind}`);
        }
    }

}
