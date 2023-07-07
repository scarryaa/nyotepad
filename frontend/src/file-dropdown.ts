import { LitElement, html, css } from "lit-element";
import { customElement } from "lit/decorators.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 *
 */
@customElement("file-dropdown")
export class FileDropdown extends LitElement {
  render() {
    return html`
      <div class="dropdown">
        <button class="dropbtn">Dropdown</button>
        <div class="dropdown-content">
          <slot></slot>
        </div>
      </div>
    `;
  }

  static styles = css`
    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      background-color: #f1f1f1;
      min-width: 160px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "file-dropdown": FileDropdown;
  }
}
