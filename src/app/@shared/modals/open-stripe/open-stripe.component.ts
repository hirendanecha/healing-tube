import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import {
  StripeCardElementChangeEvent,
  StripeCardElementOptions,
  StripeElement,
  StripeElementsOptions,
  StripePaymentElement,
  loadStripe,
} from '@stripe/stripe-js';
import { StripeCardComponent, StripeCardNumberComponent } from 'ngx-stripe';
import { environment } from 'src/environments/environment';
import { PaymentService } from '../../services/payment.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-open-stripe',
  templateUrl: './open-stripe.component.html',
  styleUrls: ['./open-stripe.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenStripeComponent implements AfterViewInit, OnInit {
  @ViewChild(StripeCardNumberComponent)
  paymentElement: StripeCardComponent;
  @Input() data: any;

  loading = false;
  elements;
  msg = '';
  stripe;
  type = '';
  element: StripePaymentElement;
  loadStripe = false;

  cardOptions: StripeCardElementOptions = {
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: '300',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };
  elementsOptions: StripeElementsOptions = {
    locale: 'en',
    appearance: {
      theme: 'stripe',
      labels: 'floating',
      variables: {
        colorPrimary: '#673ab7',
      },
    },
  };

  paymentForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private paymentService: PaymentService,
    private fb: FormBuilder,
    private toasterService: ToastService,
    private sharedService: SharedService
  ) { }

  ngOnInit(): void {
    this.paymentForm = this.fb.group({
      FirstName: ['', Validators.required],
      LastName: ['', Validators.required],
      PhoneNo: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      Skype: ['', Validators.required],
    });
  }

  ngAfterViewInit(): void {
    this.loadStripe = true;
    const payData = {
      amt: this.data.totalAmt,
      metadata: {
        selectedCard: this.data.selectedCards,
        practitionerId: this.data.practitionerId,
        profileId: this.data.profileId,
        creatorId: this.data.profileId,
        amount: this.data.totalAmt,
      },
    };
    this.paymentService.createPaymentIntent(payData).subscribe(
      (result) => {
        const getPaymentElement = document.getElementById('payment');
        const stripePromise = loadStripe(environment.stripe_key, { locale: 'en' });
        stripePromise.then((stripe) => {
          this.loadStripe = false;
          this.stripe = stripe;
          this.elements = this.stripe.elements({
            clientSecret: result.client_secret,
            description: 'Software development services',
          });
          const card = this.elements.create('payment');
          card.mount(getPaymentElement);
          card.addEventListener('change', ({ error }) => {
            console.log(error);
          });
        });
      },
      (error) => {
        this.loadStripe = false;
      }
    );
  }

  async pay() {
    const email = localStorage.getItem('email');
    this.loading = true;
    this.stripe.confirmPayment({
      elements: this.elements,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: {
            name: this.sharedService?.userData?.Username,
            email: email
          }
        }
        // return_url: 'http://localhost:4200/',
      },
      redirect: 'if_required'
    }).then((result: any) => {
      // this.spinner.hide();
      if (result.error) {
        this.toasterService.danger(result.error.message);
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === 'succeeded') {
          this.toasterService.success('the payment has been success')
          this.activeModal.close(true);
        }
      }
    });
    // if (error) {
    //   this.loading = false;
    //   console.log(error)
    //   this.toasterService.danger(error);
    //   this.activeModal.close(true);
    // }
    // if (result) {
    //   this.loading = false;
    //   if (result.error) {
    //     this.msg = result.error.message;
    //     this.toasterService.danger(result.error.message);
    //     this.type = 'danger';
    //     return;
    //   } else {
    //     console.log(result);
    //     this.activeModal.close(true);
    //   }
    // }
  }

  onChange(ev: StripeCardElementChangeEvent, id: string) {
    const displayError = document.getElementById(id);
    if (ev.error) {
      displayError.textContent = ev.error.message;
    } else {
      displayError.textContent = '';
    }
  }
}
