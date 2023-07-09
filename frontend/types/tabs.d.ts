import { LitElement } from "lit";
import { CodeEditor } from "./code-editor";
import * as monaco from "monaco-editor";
interface Tab {
    id: number;
    name: string;
    model: monaco.editor.ITextModel;
}
declare class Tabs extends LitElement {
    _editor: CodeEditor;
    constructor();
    _currentTab: number;
    tabs: Tab[];
    findTabByName(name: string): Tab | undefined;
    findTabById(id: number): Tab | undefined;
    _createNewTab(index: number): Tab;
    _setActiveTab(id: number): void;
    _closeTab(id: number): void;
    _newTab(): void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface Window {
        runtime: any;
    }
    interface HTMLElementTagNameMap {
        "app-tabs": Tabs;
    }
}
export {};
