import { LitElement, html } from "lit";
import { ServiceContainer } from "./services/container";
import { TabService } from "./services/tab.service";

import "../src/tabs.ts";
import "../src/code-editor.ts";
import { CodeEditor } from "../src/code-editor";
import { File } from "./file";

class App extends LitElement {
  _serviceContainer: ServiceContainer;
  _editor: CodeEditor;

  constructor() {
    super();
    this._serviceContainer = new ServiceContainer();
    this._serviceContainer.register("tabService", new TabService());
    this._setupEventCallbacks();

    this._editor = new CodeEditor();
  }

  render() {
    return html`<app-tabs
      ._tabService=${this._serviceContainer.get("tabService")}
    ></app-tabs>`;
  }

  public getShadowRoot() {
    return this.shadowRoot;
  }

  private _setupEventCallbacks() {
    const tabService = this._serviceContainer.get("tabService") as TabService;
  }
}

customElements.define("app-root", App);
