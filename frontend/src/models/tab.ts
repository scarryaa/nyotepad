import * as monaco from "monaco-editor";

export class Tab {
  path: undefined | string;
  id: number;
  name: string;
  model: monaco.editor.ITextModel;

  constructor(id: number, name: string, model: monaco.editor.ITextModel) {
    this.id = id;
    this.name = name;
    this.model = model;
  }

  static fromJSON(json: string): Tab {
    const { id, name, model } = JSON.parse(json);
    return new Tab(id, name, model);
  }

  static toJSON(): string {
    return JSON.stringify(this);
  }
}
