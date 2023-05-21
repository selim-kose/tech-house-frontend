import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { CartItem } from 'src/app/common/cart-item';
import { City } from 'src/app/common/city';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form-service';
import { Validator } from 'src/app/validators/validator';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];
  billingCities: City[] = [];
  shippingCities: City[] = [];

  storage: Storage = sessionStorage;

  pubKey: string = "pk_test_51N9jiaLYQcQrW3YLwq2P1CIWP5M4o9otzZnS4898p9tnMgpullU4urKaV8LnvCaaB9rzJmCM4r0X2hnFWy0OLCPy00aZw4s1lZ";

  //init Stripe API
  stripe = Stripe(this.pubKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: any = "";

  disablePaymentButton: boolean = false;


  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }


  ngOnInit(): void {
    //Setup Stripe form
    this.setupStripeForm();

    this.reviewCartDetails();


    const userEmail = JSON.parse(this.storage.getItem('userEmail')!);


    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        email: new FormControl(userEmail, [Validators.pattern('^[a-z0-9. _%+-]+@[a-z0-9.-]+\\.[a-z]{2,8}$')]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        city: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        city: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank])
      }),
      creditCard: this.formBuilder.group({
        /*   cardType: new FormControl('', [Validators.required]),
          nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
          cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
          securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
          expirationMonth: [''],
          expirationYear: [''] */
      }),
    })

    // const startMonth: number = new Date().getMonth() + 1;
    /*    this.formService.getCrediCardMonths(1).subscribe(
         data => { this.creditCardMonths = data }
       )
   
       this.formService.getCreditCardYears().subscribe(
         data => { this.creditCardYears = data }
       ) */

    this.formService.getCountries().subscribe(
      data => {
        this.countries = data
      }
    )
  }

  setupStripeForm() {
    var elements = this.stripe.elements()

    this.cardElement = elements.create('card', { hidePostalCode: true });

    //add card UI to HTML
    this.cardElement.mount('#card-element')

    //Add event binding for change event on card element
    this.cardElement.on('change', (event: any) => {
      //get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if (event.complete) {
        this.displayError.textContent = "";
      } else if (event.error) {
        this.displayError.textContent = event.error.message;
      }

    })


  }
  reviewCartDetails() {
    this.cartService.totalPrice.subscribe(data => this.totalPrice = data)

    this.cartService.totalQuantity.subscribe(data => this.totalQuantity = data)

  }


  get firstName() { return this.checkoutFormGroup.get('customer.firstName') }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName') }
  get email() { return this.checkoutFormGroup.get('customer.email') }


  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street') }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city') }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode') }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country') }


  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street') }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city') }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode') }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country') }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType') }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard') }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber') }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode') }

  copyShippingToBilling(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingCities = this.shippingCities;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingCities = [];
    }

  }

  getCities(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)

    const countryCode = formGroup?.value.country.code;

    this.formService.getCities(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingCities = data
        } else {
          this.billingCities = data
        }
        formGroup?.get('city')?.setValue(data[0]);

      }

    )
  }

  resetCart() {
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    //Update storage with empty cart
    this.cartService.persistCartItems();

    this.checkoutFormGroup.reset();


    this.router.navigateByUrl('/products')

  }

  onSubmit() {


    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
    let order = new Order(this.totalQuantity, this.totalPrice);
    const cartItems = this.cartService.cartItems;

    let orderItems: OrderItem[] = cartItems.map(cartItem => new OrderItem(cartItem))

    let purchase = new Purchase();



    purchase.customer = this.checkoutFormGroup.controls['customer'].value;

    // populate purchase shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value;
    const shippingCity: City = JSON.parse(JSON.stringify(purchase.shippingAddress.city));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.city = shippingCity.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value;
    const billingCity: City = JSON.parse(JSON.stringify(purchase.billingAddress.city));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.city = billingCity.name;
    purchase.billingAddress.country = billingCountry.name;

    purchase.order = order;
    purchase.orderItems = orderItems;

    //compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;

    //If form is valild create paymentIntent, confirm card payment, place order
    if (!this.checkoutFormGroup.invalid && this.displayError.textContent === "") {

      this.disablePaymentButton = true;

      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(
            paymentIntentResponse.client_secret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCountry.value.code
                }
              }
            }
          }, { handleActions: false }).then(
            (result: any) => {
              if (result.error) {
                //error message to customer
                alert(`there was an error: ${result.error.message}`)
                this.disablePaymentButton = false;
              } else {
                //Call REST API via the checkoutServiuce
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response: any) => {
                    alert(`Your order has been recieved. \nTracking number: ${response.orderTrackingNumber}`)
                    //reset cart
                    this.resetCart()
                    this.disablePaymentButton = false;
                  }, error: (error: any) => {
                    alert(`There was an error: ${error.message}`)
                    this.disablePaymentButton = false;
                  }
                });
              }
            })
        }
      );
    } else {
      this.checkoutFormGroup.markAllAsTouched()
      return;
    }

    //call REST API  via the CheckoutService
    /*  this.checkoutService.placeOrder(purchase).subscribe(
       {
         next: response => {
           alert(`Your order has been recieved\nTracking number: ${response.orderTrackingNumber}`)
           //reset cart
           this.resetCart();
         },
         error: error => { alert(`Something went wrong: ${error.message}`) }
       }
     ) */

  }

}




