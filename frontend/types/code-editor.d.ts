import { LitElement } from "lit";
import * as monaco from "monaco-editor";
export declare class CodeEditor extends LitElement {
    private container;
    editor?: monaco.editor.IStandaloneCodeEditor;
    _editors: {
        tab: string;
        viewState: monaco.editor.ICodeEditorViewState | undefined | null;
        model: monaco.editor.ITextModel | undefined | null;
    }[];
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
    switchTabs(currentTab: string, tab: string): void;
}
declare global {
    interface HTMLElementTagNameMap {
        "code-editor": CodeEditor;
    }
}
