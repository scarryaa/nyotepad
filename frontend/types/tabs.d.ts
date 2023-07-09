import { LitElement } from "lit";
export declare class Tabs extends LitElement {
    private _tabService;
    private _editor;
    constructor();
    private _setupEvents;
    private _handleClick;
    private _setCurrentTab;
    private _closeTab;
    private _newTab;
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
