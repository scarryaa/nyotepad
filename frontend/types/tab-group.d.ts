import { LitElement } from "lit";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export declare class TabGroup extends LitElement {
  static styles: import("lit").CSSResult;
  render(): import("lit-html").TemplateResult<1>;
}
declare global {
  interface HTMLElementTagNameMap {
    "app-tab-group": TabGroup;
  }
}
