import { ShadowRootService } from "./shadow-root.service";

export class TabService {
  _tabs = [];
  _currentTab?: number;
  _shadowRootService: ShadowRootService;

  constructor(shadowRootService: ShadowRootService) {
    this._shadowRootService = shadowRootService;
  }

  createNewTab(id: number) {
    return {
      id,
      model: null,
      name: `Untitled-${id}`,
    };
  }

  // get current tab
  getCurrentTab() {
    return this._shadowRootService
      .getShadowRoot()
      ?.querySelector(`#tab-${this._currentTab}`);
  }

  // set current tab
  setCurrentTab(tabId: number) {
    this._currentTab = tabId;
  }

  // get tabs
  getTabs() {
    return this._tabs;
  }
}
