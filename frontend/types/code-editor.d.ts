import { LitElement } from "lit";
import * as monaco from "monaco-editor";
export declare class CodeEditor extends LitElement {
    private container;
    editor?: monaco.editor.IStandaloneCodeEditor;
    theme?: string;
    language?: string;
    code?: string;
    static styles: import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
    private getFile;
    private getCode;
    private getLang;
    private getTheme;
    private isDark;
    setValue(value: string): void;
    getValue(): string;
    firstUpdated(): void;
    static createModel(value: string, language: string): monaco.editor.ITextModel;
}
declare global {
    interface HTMLElementTagNameMap {
        "code-editor": CodeEditor;
    }
}
