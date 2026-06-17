import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { CartItem, CartSummary, Product } from '../models';

const AUTH_KEY = 'shopez_auth';
const CART_KEY_PREFIX = 'cart';
const MAX_QTY = 99;

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/cart`;
  // BehaviorSubject lets all cart-dependent components react instantly after any mutation.
  private readonly itemsSubject = new BehaviorSubject<CartItem[]>(this.readCart());
  readonly items$ = this.itemsSubject.asObservable();
  constructor(private readonly http: HttpClient) {}

  addToCart(product: Product, quantity: number = 1): void {
    const cart = this.getCart();
    const existingItem = cart.find((item) => item.productId === product.id);
    const requestedQuantity = Math.max(1, Number(quantity) || 1);

    if (existingItem) {
      existingItem.quantity = Math.min(existingItem.quantity + requestedQuantity, product.stock, MAX_QTY);
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        quantity: Math.min(requestedQuantity, product.stock, MAX_QTY)
      });
    }

    this.saveCart(cart);
  }

  getCart(): CartItem[] {
    return this.itemsSubject.value;
  }

  reloadCart(): void {
    const local = this.readCart();
    this.itemsSubject.next(local);
    this.fetchRemoteCart(local);
  }

  saveCart(cart: CartItem[]): void {
    // Cart key is user-scoped; switching accounts on same browser keeps carts isolated.
    localStorage.setItem(this.cartKey(), JSON.stringify(cart));
    this.itemsSubject.next(cart);
    this.syncRemoteCart(cart);
  }

  updateQuantity(productId: number, quantity: number): void {
    const cart = this.getCart();
    const item = cart.find((cartItem) => cartItem.productId === productId);

    if (!item) {
      return;
    }

    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    item.quantity = Math.min(Number(quantity), item.stock, MAX_QTY);
    this.saveCart(cart);
  }

  removeFromCart(productId: number): void {
    const cart = this.getCart().filter((item) => item.productId !== productId);
    this.saveCart(cart);
  }

  clearCart(): void {
    this.saveCart([]);
    this.clearRemoteCart();
  }

  getSummary(cart: CartItem[] = this.getCart()): CartSummary {
    let subtotal = 0;
    let itemCount = 0;

    for (const item of cart) {
      subtotal += item.price * item.quantity;
      itemCount += item.quantity;
    }

    return {
      itemCount,
      subtotal,
      shipping: 0,
      tax: 0,
      total: subtotal
    };
  }

  formatCurrency(amount: number): string {
    return 'Rs ' + Number(amount || 0).toFixed(2);
  }

  private readCart(): CartItem[] {
    const savedCart = localStorage.getItem(this.cartKey());

    if (!savedCart) {
      return [];
    }

    try {
      // Invalid JSON is treated as empty cart to keep the storefront usable.
      return JSON.parse(savedCart) as CartItem[];
    } catch {
      return [];
    }
  }

  private cartKey(): string {
    const authJson = localStorage.getItem(AUTH_KEY);
    if (!authJson) {
      return `${CART_KEY_PREFIX}_guest`;
    }

    try {
      const user = JSON.parse(authJson) as { userId?: number };
      return user.userId ? `${CART_KEY_PREFIX}_user_${user.userId}` : `${CART_KEY_PREFIX}_guest`;
    } catch {
      return `${CART_KEY_PREFIX}_guest`;
    }
  }

  private getToken(): string | null {
    const authJson = localStorage.getItem(AUTH_KEY);
    if (!authJson) {
      return null;
    }

    try {
      const auth = JSON.parse(authJson) as { token?: string; expiresAtUtc?: string };
      if (!auth.token) {
        return null;
      }

      if (!auth.expiresAtUtc) {
        return auth.token;
      }

      return new Date(auth.expiresAtUtc).getTime() > Date.now() ? auth.token : null;
    } catch {
      return null;
    }
  }

  private getAuthHeaders(): { headers: HttpHeaders } | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  private normalize(items: CartItem[]): CartItem[] {
    if (!Array.isArray(items)) {
      return [];
    }

    return items.map((item) => {
      const source = item as CartItem & Record<string, unknown>;
      return {
        productId: Number(source['productId'] ?? source['ProductId'] ?? 0),
        name: String(source['name'] ?? source['Name'] ?? ''),
        price: Number(source['price'] ?? source['Price'] ?? 0),
        imageUrl: String(source['imageUrl'] ?? source['ImageUrl'] ?? ''),
        quantity: Math.max(1, Math.floor(Number(source['quantity'] ?? source['Quantity'] ?? 1))),
        stock: Math.max(0, Math.floor(Number(source['stock'] ?? source['Stock'] ?? 0)))
      };
    });
  }

  private fetchRemoteCart(fallbackLocal: CartItem[]): void {
    const options = this.getAuthHeaders();
    if (!options) {
      return;
    }

    this.http.get<CartItem[]>(this.baseUrl, options).subscribe({
      next: (items) => {
        const normalized = this.normalize(items);
        localStorage.setItem(this.cartKey(), JSON.stringify(normalized));
        this.itemsSubject.next(normalized);
      },
      error: () => {
        this.itemsSubject.next(fallbackLocal);
      }
    });
  }

  private syncRemoteCart(cart: CartItem[]): void {
    const options = this.getAuthHeaders();
    if (!options) {
      return;
    }

    this.http.post<CartItem[]>(`${this.baseUrl}/sync`, cart, options).subscribe({
      next: (items) => {
        const normalized = this.normalize(items);
        localStorage.setItem(this.cartKey(), JSON.stringify(normalized));
        this.itemsSubject.next(normalized);
      },
      error: () => {
      }
    });
  }

  private clearRemoteCart(): void {
    const options = this.getAuthHeaders();
    if (!options) {
      return;
    }

    this.http.delete<void>(this.baseUrl, options).subscribe({
      next: () => {
      },
      error: () => {
      }
    });
  }
}
