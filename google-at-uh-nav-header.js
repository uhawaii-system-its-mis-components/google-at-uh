import {LitElement, html} from '@polymer/lit-element';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/social-icons.js';


class GoogleAtUHNavHdeader extends LitElement {

  static get properties() {
    return {
      uhUser: Object
    }
  }

  constructor() {
    super();
  }

  _render({uhUser}) {
    // Default to &nbsp; to keep content size
    let uhUserName = uhUser.name ? uhUser.name : html`&nbsp;`;
    let uhUserEmail = uhUser.email ? uhUser.email : html`&nbsp;`;

    let avatar = html`
      <div id="genericAvatar"><iron-icon icon="social:person"></iron-icon></div>
    `;

    if (uhUser.photoUrl) {
      avatar = html`
        <iron-image id="personalAvatar" sizing="cover" src="${uhUser.photoUrl}"></iron-image>
      `;
    }

    return html`
    <style>
      :host {
        display: block;
        width: 100%;
        height: 128px;
        background: url(images/nav_header_bg.png);
        background-size: cover;
        position: relative;
        color: white;
      }
      #content {
        position: absolute;
        bottom: 0;
        left: 0;
        padding-left: 16px;
        padding-bottom: 8px;
        font-size: 14px
      }
      #personalAvatar {
        width:48px;
        height:48px;
        border-radius: 50%;
      }
      #genericAvatar {
        display:inline-block;
        padding: 4px;
        margin: 0;
        color: var(--paper-brown-100);
        background-color: var(--paper-brown-500);
        border-radius: 50%;
        width: 40px;
        height: 40px;

      }
      #genericAvatar iron-icon {
        width: 40px;
        height: 40px;
      }
    </style>
    <div id="content">
      ${avatar}
      <br/>
      <span id="name" class="paper-font-body2">${uhUserName}</span><br/>
      <span id="email" class="paper-font-body1">${uhUserEmail}</span>
    </div>
    `;
  }

}
customElements.define('google-at-uh-nav-header', GoogleAtUHNavHdeader);
