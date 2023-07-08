import { LitElement } from "lit";
import { CodeEditor } from "./code-editor";
declare class Tabs extends LitElement {
    editors?: {
        tab: string;
        editor: CodeEditor;
    }[];
    editor?: CodeEditor;
    tab?: string;
    _currentTab: string;
    _changeTab: (n: number) => void;
    firstUpdated(): void;
    render(): import("lit-html").TemplateResult<1>;
    static get styles(): import("lit").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "app-tabs": Tabs;
    }
}
export {};
