import { LitElement } from "lit-element";
/**
 * An example element.
 *
 * @slot - This element has a slot
 *
 */
export declare class FileDropdown extends LitElement {
    render(): import("lit-html").TemplateResult<1>;
    static styles: import("lit-element").CSSResult;
}
declare global {
    interface HTMLElementTagNameMap {
        "file-dropdown": FileDropdown;
    }
}
