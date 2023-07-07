import { LitElement, html, css } from "lit-element";
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
        ${this.tabs.map(
          (tab) => html`
            <div class="tab">
              <button id=${tab} @click=${this.handleDropdownClick}>
                ${tab}
              </button>
            </div>
          `
        )}
      </div>
      <div class="content"></div>
    `;
  }

  handleDropdownClick(event: MouseEvent) {
    // switch tab content
    this.currentTab = (event.target as unknown as { id: string }).id;
    const content = this.shadowRoot?.querySelector(".content");
    if (content) content.innerHTML = this.currentTab;
  }

  static styles = css`
    .tab-group {
      display: flex;
      padding: 8px;
      background-color: inherit;
      border: 1px solid #ccc;
    }

    .tab {
      position: relative;
      display: inline-block;
    }

    .tab > button {
      background-color: inherit;
      border: none;
      cursor: pointer;
      padding: 12px 16px;
      font-size: 16px;
    }

    .content {
      position: absolute;
      background-color: red;
      min-width: 160px;
      top: 100px;
      z-index: 1;
    }

    .tab:hover {
      background-color: #f1f1f1;
    }
  `;

  static properties = {
    tabs: { type: Array },
    currentTab: { type: String },
  };

  constructor() {
    super();
    this.tabs = [];
    this.currentTab = "";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tab-group": TabGroup;
  }
}
