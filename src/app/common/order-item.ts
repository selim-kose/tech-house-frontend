import { CartItem } from "./cart-item";

export class OrderItem {

   imageUrl: string
   price: number
   quantity: number
   productId: number

   constructor(cartItem: CartItem) {

      this.imageUrl = cartItem.imageUrl
      this.price = cartItem.price
      this.quantity = cartItem.quantity
      this.productId = cartItem.id;
   }
}
