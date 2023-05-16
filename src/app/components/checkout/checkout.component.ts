import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { map } from 'rxjs';
import { CartItem } from 'src/app/common/cart-item';
import { City } from 'src/app/common/city';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { FormService } from 'src/app/services/form-service';
import { Validator } from 'src/app/validators/validator';

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


  constructor(
    private formBuilder: FormBuilder,
    private formService: FormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router) { }


  ngOnInit(): void {
    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        email: new FormControl('', [Validators.pattern('^[a-z0-9. _%+-]+@[a-z0-9.-]+\\.[a-z]{2,8}$')]),
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
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Validator.nonBlank]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      }),
    })

    // const startMonth: number = new Date().getMonth() + 1;
    this.formService.getCrediCardMonths(1).subscribe(
      data => { this.creditCardMonths = data }
    )

    this.formService.getCreditCardYears().subscribe(
      data => { this.creditCardYears = data }
    )

    this.formService.getCountries().subscribe(
      data => {
        this.countries = data
      }
    )
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

    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: response => {
          alert(`Your order has been recieved\nTracking number: ${response.orderTrackingNumber}`)
          this.resetCart();
        },
        error: error => { alert(`Something went wrong: ${error.message}`) }
      }
    )

  }

}




