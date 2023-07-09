import * as monaco from "monaco-editor";
export declare class Tab {
    path: undefined | string;
    id: number;
    name: string;
    model: monaco.editor.ITextModel;
    constructor(id: number, name: string, model: monaco.editor.ITextModel);
    static fromJSON(json: string): Tab;
    static toJSON(): string;
}
