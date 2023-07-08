import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CodeEditor } from "./code-editor";

import * as monaco from "monaco-editor";

interface Tab {
  id: number;
  name: string;
  model: monaco.editor.ITextModel;
}

@customElement("app-tabs")
class Tabs extends LitElement {
  _editor!: CodeEditor;

  constructor() {
    super();
  }

  @property({ type: Number }) _currentTab: number = 0;
  @property({ type: Array }) tabs: Tab[] = [];

  _createNewTab(index: number): Tab {
    return {
      id: Math.random(),
      name: `Tab ${index}`,
      model: monaco.editor.createModel("", ""),
    };
  }

  _setActiveTab(id: number): void {
    this._currentTab = id;
    const tab = this.tabs.find((tab) => tab.id === id);
    if (tab) {
      this._editor.editor?.setModel(tab.model);
    }
  }

  _closeTab(id: number): void {
    this.tabs = this.tabs.filter((tab) => tab.id !== id);

    // if we are on the tab we are closing, switch to the last tab
    if (this._currentTab === id)
      this._setActiveTab(this.tabs[this.tabs.length - 1].id);
    // otherwise, do nothing
  }

  _newTab(): void {
    const newTab = this._createNewTab(this.tabs.length + 1);
    this.tabs = [...this.tabs, newTab];
    this._setActiveTab(newTab.id);
  }

  firstUpdated() {
    this._editor = this.shadowRoot?.querySelector("code-editor") as CodeEditor;
    this._editor.editor?.onDidChangeModelContent(() => {
      this.tabs = this.tabs.map((tab) => {
        if (tab.id === this._currentTab) {
          tab.model.setValue(this._editor.getValue());
        }
        return tab;
      });
    });
  }

  render() {
    return html`
      <div class="tabs">
        ${this.tabs.map(
          (tab) => html`
            <div
              id=${tab.id}
              class="tab ${this._currentTab === tab.id ? "active" : ""}"
              @click=${() => this._setActiveTab(tab.id)}
            >
              ${tab.name}

              <div
                class="close-tab"
                @click=${(e: Event) => {
                  e.stopPropagation(); // prevent tab from activating when close button is clicked
                  this._closeTab(tab.id);
                }}
              >
                x
              </div>
            </div>
          `
        )}
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
        height: 40px;
        background-color: #fff;
        border-bottom: 1px solid #ccc;
        user-select: none;
        width: calc(100% - 33px);
        overflow-x: scroll;
      }

      .tab {
        padding: 10px;
        cursor: pointer;
        min-width: 70px;
        min-height: 20px;
        border-right: 1px solid #ccc;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        user-select: none;
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
        user-select: none;
        background-color: #fff;
        border-bottom: 1px solid #ccc;
        border-left: 1px solid #ccc;
        height: 20px;
      }

      .close-tab {
        display: none;
        padding: 0 5px;
        margin-left: 2px;
        cursor: pointer;
        user-select: none;
      }

      .tab:hover .close-tab {
        display: inline-block;
      }

      .close-tab:hover {
        background-color: #ccc;
      }

      .main {
        width: 100%;
        height: calc(100% - 40px);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tabs": Tabs;
  }
}
