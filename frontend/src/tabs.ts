import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators";

@customElement("app-tabs")
class Tabs extends LitElement {
  static get styles() {
    return css``;
  }
  render() {
    return html`
      <div class="tabs">
        <div class="tab">
          <input type="radio" id="tab-1" name="tab-group-1" checked />
          <label for="tab-1">Tab One</label>
          <div class="content">
            <p>Stuff for Tab One</p>
          </div>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "app-tabs": Tabs;
  }
}
