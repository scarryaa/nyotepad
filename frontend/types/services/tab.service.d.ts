import { Service } from "./service";
import { Tab } from "../models/tab";
export declare class TabService extends Service {
    private _tabs;
    private _currentTab?;
    name: string;
    constructor();
    createNewTab(id: number): Tab;
    getCurrentTab(): Tab | undefined;
    setCurrentTab(tabId: number): void;
    getTabs(): Tab[];
    setTabs(tabs: Tab[]): void;
    updateCurrentTab(name: string, path?: string): void;
    findTabByName(name: string): Tab | undefined;
    findTabById(id: number): Tab | undefined;
    removeTab(id: number): void;
}
