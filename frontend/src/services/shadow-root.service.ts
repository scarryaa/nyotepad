import { LitElement } from "lit";

export class ShadowRootService extends LitElement {
  // get shadow root
  getShadowRoot() {
    return this.shadowRoot;
  }
}
