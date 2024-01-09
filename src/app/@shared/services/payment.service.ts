import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { PaymentIntent } from "@stripe/stripe-js";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  private baseUrl = environment.serverUrl + 'stripe';
  constructor(private http: HttpClient) {}

  createPaymentIntent(amount: number): Observable<PaymentIntent> {
    return this.http.post<PaymentIntent>(
      `${this.baseUrl}/create-payment-intent`,
      // `${environment.API_URL}stripe/create-payment-intent`,
      { amount }
    );
  }
}
