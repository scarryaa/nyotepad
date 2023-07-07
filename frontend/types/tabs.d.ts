import { LitElement } from "lit";
declare class Tabs extends LitElement {
    static get styles(): import("lit").CSSResult;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        "app-tabs": Tabs;
    }
}
export {};
