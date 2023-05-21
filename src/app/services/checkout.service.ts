import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Purchase } from '../common/purchase';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from '../common/payment-info';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private purhcaseUrl = environment.techHouseBaseUrl + '/checkout/purchase'
  private paymentIntentUrl = environment.techHouseBaseUrl + '/checkout/payment-intent'

  constructor(private httpClient: HttpClient) { }


  placeOrder(purchase: Purchase): Observable<any> {
    return this.httpClient.post<Purchase>(this.purhcaseUrl, purchase)
  }

  createPaymentIntent(paymentInfo: PaymentInfo): Observable<any> {
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo)
  }
}
