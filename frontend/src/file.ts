export class File {
  path: string;
  name: string;
  content: string;

  constructor(path: string, name: string, content: string) {
    this.path = path;
    this.name = name;
    this.content = content;
  }

  static fromJSON(json: string): File {
    const { path, name, content } = JSON.parse(json);
    return new File(path, name, content);
  }

  toJSON(): string {
    return JSON.stringify(this);
  }
}
