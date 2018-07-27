import {LitElement, html} from '@polymer/lit-element';
import '@polymer/iron-image/iron-image.js';
import '@polymer/paper-button/paper-button.js';


class GoogleAtUHButton extends LitElement {

  static get properties() {
    return {
      buttonText: String
    }
  }

  constructor() {
    super();
    this.buttonText = 'Sign in with Google@UH';
  }

  _render({buttonText}) {
    return html`
      <style>
        paper-button {
          padding-left: 8px;

          --paper-button-ink-color: var(--accent-color);
        }
        iron-image {
          vertical-align: middle;
          margin-right: 14px;
        }
        #buttonText {
          @apply --paper-font-body2;
        }
      </style>
      <paper-button raised><iron-image src="node_modules/@UniversityOfHawaii/google-at-uh/images/google-sign-in-logo.svg"></iron-image><span id="buttonText" class="paper-font-body2" style="font-size: 13px;">${buttonText}</span></paper-button>
    `;
  }

}
customElements.define('google-at-uh-button', GoogleAtUHButton);
