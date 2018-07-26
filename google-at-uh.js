import {LitElement, html} from '@polymer/lit-element';
import '@polymer/paper-dialog/paper-dialog.js';
import '@polymer/paper-toolbar/paper-toolbar.js';
import '@polymer/iron-image/iron-image.js';
import '@polymer/iron-icon/iron-icon.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-ajax/iron-ajax.js';
import '@polymer/paper-styles/typography.js';

import 'count-down/count-down.js'

import './google-at-uh-button.js';


// I couldn't figure out a way to import https://apis.google.com/js/platform.js
// and https://apis.google.com/js/api:client.js as es6 modules so anything that
// uses <google-at-uh> needs to include those scripts in their html page.
// See the index.html demo page for an example.

class GoogleAtUH extends LitElement {

  static get properties() {
    return {
      clientId: String,
      hostedDomain: String,
      uhJwtUrl: String,
      autoRenew: Boolean
    }
  }

  constructor() {
    super();
    this.autoRenew = true;
  }

  set uhUser(newUhUser) {
    this._uhUser = newUhUser;
    this.dispatchEvent(new CustomEvent('new-uh-jwt', {detail: newUhUser}));
  }

  get uhUser() {
    return this._uhUser;
  }

  set googleUser(newGoogleUser) {
    this._googleUser = newGoogleUser;
    this.dispatchEvent(new CustomEvent('new-google-jwt', {detail: newGoogleUser}));
  }

  get googleUser() {
    return this._googleUser;
  }

  _shouldRender(props, changedProps, prevProps) {
    if(changedProps && ("clientId" in changedProps || "hostedDomain" in changedProps || "uhJwtUrl" in changedProps)) {
      if(this.clientId) {
          this._initiateAuthentication();
      }
      return true;
    }
    else {
      false;
    }
  }

  _render() {
    return html`
      <style>
        paper-dialog {
            --paper-dialog-background-color: white;
            /* 2*24px (for left and right padding of iron-image) = 48px more than the logo width*/
            width: 298px;
            /* 8px for the spec and 2px to offset the button shadow */
            padding-bottom: 10px;
            text-align: center;
        }
        paper-dialog p {
            text-align: left;
        }
        paper-dialog paper-toolbar {
          margin-top: 0;
          padding: 0;
          --paper-toolbar-background: var(--default-primary-color);
          --paper-toolbar-color: var(--text-primary-color);
        }
        paper-dialog paper-toolbar {
          text-align: left;
        }
        #title {
          @apply --paper-font-subhead;
            margin-left: 8px;
        }
        #logo {
            width: 250px;
            height: 270px;
            margin-top: 0;
        }
        paper-icon-item {
            white-space: nowrap;
        }
        #helpLink {
            float:right;
            margin-bottom:0px;
            padding-left: 4px;
        }
        #helpLink iron-icon {
            width: 20px;
            height: 20px;
            color: var(--default-primary-color);
        }
      </style>
      <iron-ajax
        id="uhJwtAjax"
        url="${this.uhJwtUrl}"
        handleAs="json"
        on-response="${(e) => this._uhJwtAjaxResponseHandler(e)}"
        on-error="${(e) => this._uhJwtError(e)}"
        debounce-duration="300"
        loading="${this.uhJwtAjaxLoading}"></iron-ajax>
      <paper-dialog id="signInDialog" modal>
          <paper-toolbar>
              <div id="title" slot="top" class="title">Sign In</div>
          </paper-toolbar>
          <iron-image id="logo" sizing="contain" preload src="images/university-logo-stacked.jpg"></iron-image>
          <p id="helpLink"><a target="_blank" href="https://www.hawaii.edu/username"><iron-icon icon="help"></iron-icon></a></p>
          <p class="paper-font-body1">Sign in with your UH@Google account to get access to university resources.</p>
          <google-at-uh-button id="signInButton" on-tap="${() => this._signInButtonHandler()}"></google-at-uh-button>
      </paper-dialog>
    `;
  }

  /**
   * The element will attempt to initiate authentication when it's ready if its `clientId` has been set by then.
   * If the values aren't bound by that time (for whatever reason), this method is available
   * to manually kick the authentication process off when they are.
   */
  _initiateAuthentication() {
    this.dispatchEvent(new CustomEvent('authenticating'), {bubbles: true, composed: true });
    var self = this;
    gapi.load('auth2',
      function() {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        var initParams = {
          client_id: self.clientId,
          scope: 'profile email'
        };
        if (self.hostedDomain !== null) {
          initParams.hosted_domain = self.hostedDomain;
        }
        var auth2 = gapi.auth2.init(initParams);
        auth2.then(self._initializeSuccess.bind(self), self._initializeFailure.bind(self));
          let signInButton = self.shadowRoot.querySelector('#signInButton')
          //We don't need a success handler because we already have the googleAuth.currentUser listener
          //If the user deny's the authorization request the error handler will be called.
          auth2.attachClickHandler(signInButton, {}, null, self._googleSignInFailure);
      });
  }

  _initializeSuccess(googleAuth) {
    if (googleAuth.isSignedIn.get()) {
      this.googleUser = this._createDataBindingGoogleUser(googleAuth.currentUser.get());
      this.renewUhJwt();
    } else {
      this.googleUser = null;
      let signInDialog = this.shadowRoot.querySelector('#signInDialog');
      this.dispatchEvent(new CustomEvent('finished-authenticating', {bubbles: true, composed: true }));
      signInDialog.open();
    }
    googleAuth.currentUser.listen(this._auth2GoogleUserChanged.bind(this));
  }

  _signInButtonHandler() {
    this.dispatchEvent(new CustomEvent('authenticating', {bubbles: true, composed: true }));
  }

  _initializeFailure(error) {
    this.dispatchEvent(new CustomEvent('google-initialize-error', error));
    this.dispatchEvent(new CustomEvent('finished-authenticating', {bubbles: true, composed: true }));
  }

  _googleSignInFailure(error) {
    this.dispatchEvent(new CustomEvent('google-sign-in-error', error));
    this.dispatchEvent(new CustomEvent('finished-authenticating', {bubbles: true, composed: true }));
  }

  /**
   * Google's gapi will automatically call this method about 5 minutes before the current token expires.
   */
  _auth2GoogleUserChanged(currentUser) {
    if (currentUser.isSignedIn()) {
      this.googleUser = this._createDataBindingGoogleUser(currentUser);
      //console.log('Logged in (google) as: ' + this.googleUser.email);
      let signInDialog = this.shadowRoot.querySelector('#signInDialog')
      signInDialog.close();
      this.renewUhJwt();
    } else {
      //The user signs out of their Google account.
      this._signOutUsers();
    }
  }

  /**
   * The gapi.auth2 GoogleUser is difficult to work with because all the values are buried in method calls.
   * This method copies the interesting values from the gapi.auth2 GoogleUser into a data binding friendly format.
   */
  _createDataBindingGoogleUser(originalGoogleUser) {
    if (originalGoogleUser === null) {
      return null;
    }
    var basicProfile = originalGoogleUser.getBasicProfile();
    var authResponse = originalGoogleUser.getAuthResponse();
    var googleUser = {
      'name': basicProfile.getName(),
      'givenName': basicProfile.getGivenName(),
      'familyName': basicProfile.getFamilyName(),
      'email': basicProfile.getEmail(),
      'id': basicProfile.getId(),
      'photoUrl': basicProfile.getImageUrl(),
      'jwt': authResponse.id_token,
      'expiresIn': authResponse.expires_in,
      'expiresAt': authResponse.expires_at,
      'hostedDomain': originalGoogleUser.getHostedDomain()
    };
    return googleUser;
  }

  /**
   * Signs the Google account out of the application and removes the `googleUser` and `uhUser` from memory.
   * Any copies of the token will still be valid for authentication until they expire since there is (currently)
   * no mechanism in place for invalidating them.
   */
  signOut() {
    var auth2 = gapi.auth2.getAuthInstance();
    auth2.signOut().then(function(param1, param2) {
        //The user will still be logged in to Google so _auth2GoogleUserChanged is not called.
        this._signOutUsers();
    }.bind(this));
  }

  _signOutUsers() {
      this.googleUser = null;
      //Note that the any non-expired UH JWTs will still be valid.  There is no logout on the server.;
      this.uhUser = null;
      let signInDialog = this.shadowRoot.querySelector('#signInDialog');
      signInDialog.open()
  }

  /**
   * Request a new JWT from the service endpoint (`uhJwtUrl`). If successful, the new-uh-jwt event will be triggered
   * and the `uhUser` object itself will be updated.
   */
  renewUhJwt() {
    // TODO It's possible to call this multiple times and fire multiple requests
    // We should probably only have one renew request going or make the response
    // handlers aware.  At the very least they should handle the loading

    //console.log('Getting new UH JWT.');
    let uhJwtAjax = this.shadowRoot.querySelector('#uhJwtAjax');
    if (this.googleUser) {
      uhJwtAjax.headers['Authorization'] = this.googleUser.jwt;
    }

    let request = uhJwtAjax.generateRequest();
    this.dispatchEvent(new CustomEvent('authenticating', {bubbles: true, composed: true }));
  }

  _uhJwtAjaxResponseHandler(e) {
    this.dispatchEvent(new CustomEvent('finished-authenticating', {bubbles: true, composed: true }));

    var uhUser = e.detail.response;
    if(this.autoRenew && uhUser && uhUser.uhJwtExpireTime) {
      var msUntilExpired = e.detail.response.uhJwtExpireTime - new Date().getTime();
      var msUntilRenew = null;
      //If the expiration is longer than 5 minutes from now renew 5 minutes early
      if(msUntilExpired > 300000) {
        msUntilRenew = msUntilExpired - 300000;
      }
      //If the expiration is longer than 60 seconds from now renew 30 seconds early
      else if(msUntilExpired >= 60000) {
        msUntilRenew = msUntilExpired - 30000;
      }

      if(msUntilRenew) {
          //console.log('UH JWT renewal scheduled in ' + msUntilRenew / 1000 + ' seconds');
          setTimeout(this.renewUhJwt.bind(this), msUntilRenew);
      }
      else {
        console.warn("Not scheduling automatic UH JWT renewal because expiration is too short.")
      }

    }
    this.uhUser = uhUser;
    //console.log('Logged in (service) as: ' + this.uhUser.name);
  }

  _uhJwtError(e) {
    //console.error('Error logging in to service.');
    this.uhUser = null;
    this.dispatchEvent(new CustomEvent('uh-jwt-error', e.detail));
    this.dispatchEvent(new CustomEvent('finished-authenticating', {bubbles: true, composed: true }));
  }

}
customElements.define('google-at-uh', GoogleAtUH);
