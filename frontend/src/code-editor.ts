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

// @ts-ignore
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
  @property() theme?: string;
  @property() language?: string;
  @property() code?: string;

  constructor() {
    super();
    this.setUpEvents();
  }

  static styles = css`
    :host {
      --editor-width: 100%;
      --editor-height: 100%;
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

  public setValue(value: string) {
    this.editor!.setValue(value);
  }

  public getValue() {
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
  }

  static createModel(value: string, language: string) {
    return monaco.editor.createModel(value, language);
  }

  private setUpEvents() {
    // capture undo event from go
    window.runtime.EventsOn("undo", () => {
      this.editor?.trigger("keyboard", "undo", null);
    });

    // capture redo event from go
    window.runtime.EventsOn("redo", () => {
      this.editor?.trigger("keyboard", "redo", null);
    });

    // capture cut event from go
    window.runtime.EventsOn("cut", () => {
      this.editor?.trigger("keyboard", "cut", null);
    });

    // capture copy event from go
    window.runtime.EventsOn("copy", () => {
      this.editor?.trigger("source", "editor.action.clipboardCopyAction", null);
    });

    // capture paste event from go
    window.runtime.EventsOn("paste", () => {
      this.editor?.trigger(
        "source",
        "editor.action.clipboardPasteAction",
        null
      );
    });

    // capture select all event from go
    window.runtime.EventsOn("selectAll", () => {
      const range = this.editor?.getModel()?.getFullModelRange()!;
      this.editor?.setSelection(range);
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "code-editor": CodeEditor;
  }
}
