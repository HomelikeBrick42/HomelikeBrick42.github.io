namespace Langite {

    export class SourceLocation {
        public Filepath: string;
        public Source: string;
        public Position: number;
        public Line: number;
        public Column: number;

        public constructor(filepath: string, source: string, position: number, line: number, column: number) {
            this.Filepath = filepath;
            this.Source = source;
            this.Position = position;
            this.Line = line;
            this.Column = column;
        }

        public Clone(): SourceLocation {
            return new SourceLocation(
                this.Filepath,
                this.Source,
                this.Position,
                this.Line,
                this.Column,
            );
        }

        public toString = (): string => {
            return `${this.Filepath}:${this.Line}:${this.Column}`;
        }
    }

}
