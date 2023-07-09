import { CodeEditor } from "../code-editor";
import { Service } from "./service";
import { Tab } from "../models/tab";
import { customElement, state } from "lit/decorators.js";

@customElement("tab-service")
export class TabService extends Service {
  @state() private _tabs: Tab[] = [];
  @state() private _currentTab?: number;
  name: string;

  constructor() {
    super();
    this.name = "tabService";
    this._tabs = [];
  }

  public createNewTab() {
    let id = 1;
    while (this._tabs.find((tab) => tab.id === id)) {
      id++;
    }

    var tab: Tab = {
      path: undefined,
      id: id,
      name: `Untitled-${id}`,
      model: CodeEditor.createModel("", ""),
    };

    this._tabs = [...this._tabs, tab];
    this._currentTab = tab.id;
    console.log(tab);
    return tab;
  }

  // get current tab
  public getCurrentTab() {
    return this._tabs.find((tab) => tab.id === this._currentTab);
  }

  // set current tab
  public setCurrentTab(tabId: number) {
    this._currentTab = tabId;
  }

  // get tabs
  public getTabs() {
    return this._tabs;
  }

  // set tabs
  public setTabs(tabs: Tab[]) {
    this._tabs = tabs;
  }

  // update current tab
  public updateCurrentTab(name: string, path?: string) {
    const currTab = this._tabs.find((tab) => tab.id === this._currentTab);
    if (currTab) {
      currTab.name = name;
      currTab.path = path || currTab.path;
    }
  }

  findTabByName(name: string): Tab | undefined {
    return this._tabs.find((tab) => tab.name === name);
  }

  findTabById(id: number): Tab | undefined {
    return this._tabs.find((tab) => tab.id === id);
  }

  removeTab(id: number): void {
    const removedTab = this._tabs.find((tab) => tab.id === id);
    this._tabs.splice(this._tabs.indexOf(removedTab!), 1);

    // if we are on the tab we are closing, switch to the last tab
    if (this._currentTab === id) {
      if (this._tabs.length > 0) {
        this._currentTab = this._tabs[this._tabs.length - 1].id;
      } else {
        this._currentTab = undefined;
      }
    }
  }
}
