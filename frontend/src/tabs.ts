import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { CodeEditor } from "./code-editor";

import * as monaco from "monaco-editor";
import { File } from "./file";

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

    // capture fileopen event from Go
    window.runtime.EventsOn("fileOpen", (e: any) => {
      // decode base64 string
      const decoded = JSON.parse(atob(e))[0];
      const newTab = this._createNewTab(this.tabs.length + 1);
      console.log(decoded.Name, decoded.Content);
      newTab.name = decoded.Name.split("/").pop() || "Untitled";
      newTab.model.setValue(decoded.Content);
      this.tabs = [...this.tabs, newTab];
      this._setActiveTab(newTab.id);
    });

    // capture saveAs event from Go
    window.runtime.EventsOn("saveAs", () => {
      // decode base64 string
      var currTab = this.findTabByName(this._currentTab.toString());
      window.runtime.EventsEmit(
        "saveAsResponse",
        new File(
          currTab?.name || "Untitled",
          currTab?.name || "Untitled",
          currTab?.model.getValue() || ""
        )
      );
    });
  }

  @property({ type: Number }) _currentTab: number = 0;
  @property({ type: Array }) tabs: Tab[] = [];

  findTabByName(name: string): Tab | undefined {
    return this.tabs.find((tab) => tab.name === name);
  }

  findTabById(id: number): Tab | undefined {
    return this.tabs.find((tab) => tab.id === id);
  }

  _createNewTab(index: number): Tab {
    return {
      id: Math.random(),
      name: `Untitled-${index}`,
      model: monaco.editor.createModel("", ""),
    };
  }

  _setActiveTab(id: number): void {
    this._currentTab = id;
    const tab = this.tabs.find((tab) => tab.id === id);
    if (tab) {
      this._editor.editor?.setModel(tab.model);
    }

    this.shadowRoot?.querySelector(".tabs")?.scrollTo({
      left: document.getElementById(id.toString())?.offsetLeft,
      top: 0,
      behavior: "smooth",
    });
  }

  _closeTab(id: number): void {
    this.tabs = this.tabs.filter((tab) => tab.id !== id);

    // if we are on the tab we are closing, switch to the last tab
    if (this._currentTab === id) {
      if (this.tabs.length > 0) {
        this._setActiveTab(this.tabs[this.tabs.length - 1].id);
      } else {
        this._editor.editor?.setModel(null);
      }
    }
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

    // add drag and drop functionality to tabs
    const tabs = this.shadowRoot?.querySelector(".tabs");
    if (tabs) {
      tabs.addEventListener("dragstart", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("tab")) {
          (e as any).dataTransfer?.setData("text/plain", target.id);
        }
      });

      tabs.addEventListener("dragover", (e) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target.classList.contains("tab")) {
          target.classList.add("dragover");
        }
      });

      tabs.addEventListener("dragleave", (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("tab")) {
          target.classList.remove("dragover");
        }
      });

      tabs.addEventListener("drop", (e) => {
        e.preventDefault();
        const target = e.target as HTMLElement;
        if (target.classList.contains("tab")) {
          target.classList.remove("dragover");
          const sourceId = (e as any).dataTransfer?.getData("text/plain");
          const targetId = target.id;
          const targetIndex = this.tabs.findIndex(
            (tab) => tab.id.toString() === targetId
          );
          const sourceIndex = this.tabs.findIndex(
            (tab) => tab.id.toString() === sourceId
          );
          const sourceTab = this.tabs[sourceIndex];
          const targetTab = this.tabs[targetIndex];
          this.tabs[targetIndex] = sourceTab;
          this.tabs[sourceIndex] = targetTab;
          this.requestUpdate();
        }
      });
    }
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
              draggable="true"
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
      .main {
        height: calc(100% - 40px);
        width: 100%;
        display: flex;
        flex-direction: row;
      }

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
        overflow-y: hidden;
      }

      .tab {
        padding: 10px;
        cursor: pointer;
        min-width: max-content;
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
        margin-left: 5px;
        padding: 2px 5px;
        display: inline-block;
        visibility: hidden;
        cursor: pointer;
        user-select: none;
      }

      .tab:hover .close-tab {
        visibility: visible !important;
      }

      .close-tab:hover {
        background-color: #ccc;
      }

      .main {
        height: calc(100% - 40px);
        display: flex;
        flex-direction: row;
      }

      code-editor {
        width: 100%;
        height: 100%;
      }

      .dragover {
        background-color: #ddd;
      }

      .dragover .close-tab {
        visibility: hidden;
      }
    `;
  }
}

declare global {
  interface Window {
    runtime: any;
  }

  interface HTMLElementTagNameMap {
    "app-tabs": Tabs;
  }
}
