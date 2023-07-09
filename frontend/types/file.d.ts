export declare class File {
    path: string;
    name: string;
    content: string;
    constructor(path: string, name: string, content: string);
    static fromJSON(json: string): File;
    static toJSON(): string;
}
