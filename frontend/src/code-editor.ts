import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { createRef, Ref, ref } from "lit/directives/ref.js";

// -- Monaco Editor Imports --
import * as monaco from "monaco-editor";
import styles from "monaco-editor/min/vs/editor/editor.main.css";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";

self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === "json") {
      return new jsonWorker();
    }
    if (label === "css" || label === "scss" || label === "less") {
      return new cssWorker();
    }
    if (label === "html" || label === "handlebars" || label === "razor") {
      return new htmlWorker();
    }
    if (label === "typescript" || label === "javascript") {
      return new tsWorker();
    }
    return new editorWorker();
  },
};

@customElement("code-editor")
export class CodeEditor extends LitElement {
  private container: Ref<HTMLElement> = createRef();
  editor?: monaco.editor.IStandaloneCodeEditor;
  _editors: {
    tab: string;
    viewState: monaco.editor.ICodeEditorViewState | undefined | null;
    model: monaco.editor.ITextModel | undefined | null;
  }[] = [
    {
      tab: "1",
      viewState: null,
      model: monaco.editor.createModel("", "javascript"),
    },
  ];

  public newModel = (code: string, lang: string) => {
    const model = monaco.editor.createModel(code, lang);
    this._editors.push({
      tab: (this._editors.length + 1).toString(),
      viewState: null,
      model,
    });
    this.switchTabs(
      this._editors.length.toString(),
      (this._editors.length + 1).toString()
    );
  };

  @property() theme?: string;
  @property() language?: string;
  @property() code?: string;

  static styles = css`
    :host {
      --editor-width: 100%;
      --editor-height: 100vh;
    }

    main {
      width: var(--editor-width);
      height: var(--editor-height);
    }
  `;

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <main ${ref(this.container)}></main>
    `;
  }

  private getFile() {
    if (this.children.length > 0) return this.children[0];
    return null;
  }

  private getCode() {
    if (this.code) return this.code;
    const file = this.getFile();
    if (!file) return;
    return file.innerHTML.trim();
  }

  private getLang() {
    if (this.language) return this.language;
    const file = this.getFile();
    if (!file) return;
    const type = file.getAttribute("type")!;
    return type.split("/").pop()!;
  }

  private getTheme() {
    if (this.theme) return this.theme;
    if (this.isDark()) return "vs-dark";
    return "vs-light";
  }

  private isDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  setValue(value: string) {
    this.editor!.setValue(value);
  }

  getValue() {
    const value = this.editor!.getValue();
    return value;
  }

  firstUpdated() {
    this.editor = monaco.editor.create(this.container.value!, {
      value: this.getCode(),
      language: this.getLang(),
      theme: this.getTheme(),
      automaticLayout: true,
      model: null,
    });

    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", () => {
        monaco.editor.setTheme(this.getTheme());
      });

    const model = monaco.editor.createModel(
      this.getCode() || "",
      this.getLang()
    );
    this.editor.setModel(model);
    this._editors[0].model = model;
    this._editors[0].viewState = this.editor.saveViewState();
    this._editors[0].tab = "1";
  }

  public switchTabs(currentTab: string, tab: string) {
    // if the current tab is the same as the tab we're switching to, do nothing
    if (currentTab === tab) return;

    // if tab exists, overwrite it
    // else create new tab
    const tabCtx = this._editors.find((ctx) => ctx.tab === currentTab);

    if (tabCtx?.tab) {
      tabCtx.viewState = this.editor?.saveViewState();
      tabCtx.model = this.editor?.getModel()!;
      console.log("tabCtx", tabCtx);
    } else {
      this._editors.push({
        tab: currentTab,
        viewState: this.editor?.saveViewState(),
        model: this.editor?.getModel()!,
      });
    }

    // switch to tab
    const newTabCtx = this._editors.find((ctx) => ctx.tab === tab);
    console.log(newTabCtx);
    this.editor?.restoreViewState(newTabCtx?.viewState || null);
    this.editor?.setModel(
      newTabCtx?.model || monaco.editor.createModel("", "")
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "code-editor": CodeEditor;
  }
}
