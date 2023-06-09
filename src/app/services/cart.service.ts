import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems: CartItem[] = [];
  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  //web browsers session storage
  storage: Storage = sessionStorage;

  constructor() {
    let data = JSON.parse(this.storage.getItem('cartItems')!)

    if (data != null) {
      this.cartItems = data;
      this.cartTotals();
    }
  }


  addToCart(cartItem: CartItem) {
    //Check if item is already in cart
    let alreadyExistsInCart: boolean = false;
    let existingCartItem: CartItem = undefined!;

    if (this.cartItems.length > 0) {

      //find item in cart basesd on id
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === cartItem.id)!;

      //check if we found it      add () if not working
      alreadyExistsInCart = existingCartItem != undefined
    }

    if (alreadyExistsInCart) {
      //increment the quantity
      existingCartItem.quantity++;
    } else {
      //add item to array
      this.cartItems.push(cartItem)
    }
    //count total price and total quantity
    this.cartTotals();
  }

  cartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let currentCartItem of this.cartItems) {
      totalPriceValue += currentCartItem.quantity * currentCartItem.price;
      totalQuantityValue += currentCartItem.quantity;
    }

    //publish total values to subscribers

    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue)

    //Persist cart data

    this.persistCartItems();

  }

  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems))
  }

  decrementQuantity(cartItem: CartItem) {
    cartItem.quantity--;

    if (cartItem.quantity === 0) {
      this.remove(cartItem);
    } else {
      this.cartTotals();
    }
  }

  remove(cartItem: CartItem) {
    const index = this.cartItems.findIndex(itemToFind => itemToFind.id === cartItem.id);

    if (index > -1) {
      this.cartItems.splice(index, 1)
      this.cartTotals();
    }
  }

}

