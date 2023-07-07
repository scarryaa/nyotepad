import { LitElement, html, css, PropertyDeclarations } from "lit-element";
import { customElement } from "lit/decorators.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement("app-tab-group")
export class TabGroup extends LitElement {
  onNewFile() {
    console.log("onNewFile");
  }

  onOpenFile() {
    console.log("onOpenFile");
  }

  onSaveFile() {
    console.log("onSaveFile");
  }

  onSaveAsFile() {
    console.log("onSaveAsFile");
  }

  render() {
    return html`
      <div class="tab-group">
        ${this.menuItems.map(
          (menuItem) => html`
            <div class="dropdown">
              <button @click=${this.handleDropdownClick}>
                Dropdown ${menuItem}
              </button>
              <div class="dropdown-content">
                <div class="dropdown-item">Option 1</div>
                <div class="dropdown-item">Option 2</div>
                <div class="dropdown-item">Option 3</div>
              </div>
            </div>
          `
        )}
      </div>
    `;
  }

  handleDropdownClick(event: MouseEvent) {
    const dropdownContent = event.target?.nextElementSibling;
    dropdownContent.style.display =
      dropdownContent.style.display === "block" ? "none" : "block";
  }

  static styles = css`
    .tab-group {
      display: flex;
      padding: 8px;
      background-color: inherit;
      border: 1px solid #ccc;
    }

    .dropdown {
      position: relative;
      display: inline-block;
    }

    .dropdown > button {
      background-color: inherit;
      border: none;
      cursor: pointer;
      padding: 12px 16px;
      font-size: 16px;
    }

    .dropdown-content {
      display: none;
      position: absolute;
      background-color: #f9f9f9;
      min-width: 160px;
      box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
      z-index: 1;
    }

    .dropdown:hover .dropdown-content {
      display: block;
    }

    .dropdown-item {
      padding: 12px 16px;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background-color: #f1f1f1;
    }
  `;

  static properties = {
    menuItems: { type: Array },
  };

  constructor() {
    super();
    this.menuItems = [];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tab-group": TabGroup;
  }
}
