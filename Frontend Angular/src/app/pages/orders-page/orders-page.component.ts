import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Order } from '../../models';
import { ShopCurrencyPipe } from '../../pipes/shop-currency.pipe';
import { getApiErrorMessage } from '../../services/api-error';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  imports: [DatePipe, RouterLink, ShopCurrencyPipe],
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.css'
})
export class OrdersPageComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  error = '';

  constructor(
    private readonly orderService: OrderService,
    readonly auth: AuthService,
    readonly cart: CartService
  ) {}

  ngOnInit(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.loading = false;
      },
      error: (error) => {
        this.error = getApiErrorMessage(error);
        this.loading = false;
      }
    });
  }
}
