import {Component, Inject, OnInit} from '@angular/core';


import {inject} from '@angular/core/testing';
import {OKTA_AUTH} from '@okta/okta-angular';
import {OktaAuth} from '@okta/okta-auth-js';
import AppConfig from '../../config/app-config';
import OktaSignIn from '@okta/okta-signin-widget'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  oktaSigning: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.oktaSigning = new OktaSignIn({
       logo: 'assets/logo/tech-house-high-resolution-logo-black-on-white-background.png',
      baseUrl: AppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: AppConfig.oidc.clientId,
      redirectUri: AppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: AppConfig.oidc.issuer,
        scopes: AppConfig.oidc.scopes
      },
      features: {
        registration: true  // Enable self-service registration
      }
    });
  }

  ngOnInit(): void {
    this.oktaSigning.remove()

    this.oktaSigning.renderEl({el: '#okta-sign-in'}, //this name must be same as the id in the div tag
      (response: any) => {
        if (response.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        throw error
      }
    );
  }
}
