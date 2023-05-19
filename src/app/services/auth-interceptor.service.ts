import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Observable, from, lastValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return from(this.handleAccess(request, next));
  }


  private async handleAccess(request: HttpRequest<any>, next: HttpHandler): Promise<HttpEvent<any>> {
    const securedEndPoints = [environment.techHouseBaseUrl + '/orders'];

    if (securedEndPoints.some(url => request.urlWithParams.includes(url))) {
      const accessToken = this.oktaAuth.getAccessToken();

      //Add new header with access token. We clone beacause request is immutable
      request = request.clone({
        setHeaders: { Authorization: 'Bearer ' + accessToken }
      })
    }
    return await lastValueFrom(next.handle(request));
  }
}
