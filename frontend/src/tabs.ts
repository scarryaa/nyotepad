import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CodeEditor } from "./code-editor";

@customElement("app-tabs")
class Tabs extends LitElement {
  @property() editors?: { tab: string; editor: CodeEditor }[];
  @property() editor?: CodeEditor;
  @property() tab?: string;
  _currentTab: string = "1";

  constructor() {
    super();
    this.editors = [];
  }

  _init = () => {
    this.editor = this.shadowRoot?.querySelector(".editor") as CodeEditor;
    this.editor?.addEventListener("editor-ready", () => {
      this._newTab();
    });
  };

  _changeTab = (n: number) => {
    this.editor = this.shadowRoot?.querySelector(".editor") as CodeEditor;
    this.editor.switchTabs(this._currentTab, n.toString());
    this._currentTab = n.toString();

    // add active class to tab
    const tabs = this.shadowRoot?.querySelectorAll(".tab");
    tabs?.forEach((tab) => {
      tab.classList.remove("active");
    });

    const activeTab = this.shadowRoot?.querySelector(`.tab:nth-child(${n})`);
    activeTab?.classList.add("active");
  };

  _newTab = () => {
    // insert new tab
    const tabs = this.shadowRoot?.querySelector(".tabs");
    const newTab = document.createElement("div");
    newTab.classList.add("tab");
    newTab.innerHTML = `Tab ${this.editors?.length + 1}`;
    newTab.addEventListener("click", () =>
      this._changeTab((this._currentTab as unknown as number) + 1)
    );
    tabs?.insertBefore(newTab, tabs.lastChild);
    this.editor?.newModel("", "javascript");
  };

  render() {
    return html`
      <div class="tabs">
        <div class="tab" @click=${() => this._changeTab(1)}>Tab 1</div>
        <div class="new-tab" @click=${() => this._newTab()}>+</div>
      </div>
      <main class="main">
        <code-editor class="editor"></code-editor>
      </main>
    `;
  }

  static get styles() {
    return css`
      .tabs {
        display: flex;
        flex-direction: row;
        align-items: center;
        width: 100%;
        background-color: #fff;
        border-bottom: 1px solid #ccc;
      }

      .tab {
        padding: 10px;
        cursor: pointer;
      }

      .tab.active {
        background-color: #eee;
      }

      .tab.active:hover {
        background-color: #ddd;
      }

      .tab.active:active {
        background-color: #ccc;
      }

      .tab:hover {
        background-color: #eee;
      }

      .tab:active {
        background-color: #ddd;
      }

      .new-tab {
        padding: 10px;
        cursor: pointer;
        position: absolute;
        right: 0;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tabs": Tabs;
  }
}
