import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css']
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false;
  userFullName: string = '';
  userEmail: string = '';
  //browser session storage, each tap store its session. Once tab is closed memory is lost
  storage: Storage = sessionStorage;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth, private oktaAuthService: OktaAuthStateService) { }

  ngOnInit(): void {
    this.oktaAuthService.authState$.subscribe((result) => {
      this.isAuthenticated = result.isAuthenticated!;
      this.getUserDetails();
    })
  }

  getUserDetails() {
    if (this.isAuthenticated) {
      this.oktaAuth.getUser().then((resesponse) => {
        //get users name from auth response
        this.userFullName = resesponse.name as string
        //get users email from auth response
        this.userEmail = resesponse.email as string;
        //store email in browser session sotrage
        this.storage.setItem('userEmail', JSON.stringify(this.userEmail))

      })
    }
  }

  logout() {
    this.oktaAuth.signOut();
  }
}
