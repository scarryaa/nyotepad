import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

import { TabService } from "./services/tab.service";
import { CodeEditor } from "./code-editor";
import { File } from "./file";

@customElement("app-tabs")
export class Tabs extends LitElement {
  @property({ type: Object }) private _tabService!: TabService;
  private _editor!: CodeEditor;

  constructor() {
    super();
  }

  private _setUpEvents() {
    // capture fileopen event
    window.runtime.EventsOn("fileOpen", (e: any) => {
      // decode base64 string
      const decoded = JSON.parse(atob(e))[0];
      const newTab = this._tabService.createNewTab();
      console.log(decoded.Path, decoded.Name, decoded.Content);
      newTab.path = decoded.Path;
      newTab.name = decoded.Name.split("/").pop() || "Untitled";
      newTab.model.setValue(decoded.Content);
      this._setCurrentTab(newTab.id);
    });

    // capture saveAs event from Go
    window.runtime.EventsOn("saveAs", () => {
      // decode base64 string
      const currTab = this._tabService.getCurrentTab();

      console.log(currTab?.name, currTab?.model.getValue());
      window.runtime.EventsEmit("saveAsResponse", [
        new File(
          currTab?.path || "",
          currTab?.name || "Untitled",
          currTab?.model.getValue() || ""
        ),
      ]);
    });

    // capture save event from Go
    window.runtime.EventsOn("save", () => {
      // decode base64 string
      const currTab = this._tabService.getCurrentTab();

      console.log(currTab?.name, currTab?.model.getValue());
      window.runtime.EventsEmit("saveResponse", [
        new File(
          currTab?.path || "",
          currTab?.name || "Untitled",
          currTab?.model.getValue() || ""
        ),
      ]);
    });

    // capture new event from Go
    window.runtime.EventsOn("new", () => {
      this._newTab();
    });

    // capture close event from Go
    window.runtime.EventsOn("close", () => {
      const currTab = this._tabService.getCurrentTab();
      if (currTab) {
        this._closeTab(currTab.id);
      }
    });

    // capture save completed event from Go
    window.runtime.EventsOn("fileSaved", (e: string) => {
      // decode base64 string
      const decoded = JSON.parse(atob(e))[0];
      console.log(decoded.Path, decoded.Name, decoded.Content);
      this._tabService.updateCurrentTab(decoded.Name, decoded.Path);
      this.requestUpdate();
    });

    // add drag and drop functionality to tabs
    const tabs = this.shadowRoot?.querySelector(".tabs");
    if (tabs) {
      // listen to mouse wheel event and update scrollbar
      tabs.addEventListener("wheel", (e: any) => {
        // if shift key is pressed, change tab
        if (e.shiftKey) {
          // if scrolling down, go to next tab
          if (e.deltaY > 0) {
            this._tabService.setCurrentTab(
              this._tabService.getCurrentTab()?.id || 0 + 1
            );
          } else {
            this._tabService.setCurrentTab(
              this._tabService.getCurrentTab()?.id || 0 - 1
            );
          }
        }

        const tabs = this.shadowRoot?.querySelector(".tabs");
        if (tabs) {
          tabs.scrollLeft += e.deltaY;
        }
      });

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
          const id = (e as any).dataTransfer?.getData("text/plain");
          const targetTab = this._tabService.findTabById(parseInt(id));
          const draggedTab = this._tabService.findTabById(parseInt(target.id));

          if (targetTab && draggedTab) {
            this._tabService.setTabs(
              this._tabService.getTabs().map((tab) => {
                if (tab.id === targetTab.id) {
                  return draggedTab;
                } else if (tab.id === draggedTab.id) {
                  return targetTab;
                } else {
                  return tab;
                }
              })
            );
          }
        }
        this.requestUpdate();
      });
    }
  }

  private _handleClick(e: any): void {
    const target = e.target as HTMLElement;
    e.preventDefault();
    // left click to switch tab
    if (e.button === 0 && !target.classList.contains("close-tab")) {
      this._setCurrentTab(parseInt(target?.id || ""));
      return;
      // middle click to close tab
    } else if (e.button === 1) {
      this._closeTab(parseInt(target?.id || ""));
      return;
      // right click to do nothing
    } else if (e.button === 2) {
      return;
    }
  }

  private _setCurrentTab(id: number): void {
    this._tabService.setCurrentTab(id);
    this._editor.editor?.setModel(this._tabService.getCurrentTab()?.model!);

    this.requestUpdate();

    // scroll to the current tab
    const tabs = this.shadowRoot?.querySelector(".tabs");
    if (tabs) {
      const currentTab = this.shadowRoot?.querySelector(
        `.tab-${this._tabService.getCurrentTab()?.id}`
      );
      if (currentTab) {
        tabs.scrollLeft = (currentTab as HTMLElement).offsetLeft;
      }
    }
  }

  private _closeTab(id: number): void {
    this._tabService.removeTab(id);

    // switch the view to the last tab if we are closing the current tab
    if (this._tabService.getCurrentTab() !== undefined) {
      this._editor.editor?.setModel(this._tabService.getCurrentTab()?.model!);
    } else {
      // otherwise, clear the view
      this._editor.editor?.setModel(null);
    }

    this.requestUpdate();
  }

  private _newTab(): void {
    const newTab = this._tabService.createNewTab();
    this._setCurrentTab(newTab.id);

    this._editor.focus();
    this.requestUpdate();

    // scroll to the new tab
    const tabs = this.shadowRoot?.querySelector(".tabs");
    if (tabs) {
      setTimeout(
        () =>
          (tabs.scrollLeft = (
            this.shadowRoot?.querySelector(
              `.tab-${this._tabService.getCurrentTab()?.id}`
            ) as HTMLElement
          ).offsetLeft),
        0
      );
    }
  }

  firstUpdated() {
    this._editor = this.shadowRoot?.querySelector("code-editor") as CodeEditor;
    this._setUpEvents();
  }

  render() {
    return html`
      <div class="tabs">
        ${this._tabService.getTabs().map(
          (tab) => html`
            <div
              id="${tab.id}"
              class="tab tab-${tab.id} ${this._tabService.getCurrentTab()
                ?.id === tab.id
                ? "active"
                : ""}"
              @click=${(e: MouseEvent) => this._handleClick(e)}
              draggable="true"
            >
              ${tab.name}

              <div class="close-tab" @click=${() => this._closeTab(tab.id)}>
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
        overflow-x: overlay;
        overflow-y: hidden;
      }

      .tab {
        padding: 10px;
        cursor: pointer;
        min-width: max-content;
        min-height: 20px;
        max-height: 20px;
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
        max-height: 20px;
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
