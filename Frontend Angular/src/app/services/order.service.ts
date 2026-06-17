import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateOrderRequest, Order } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class OrderService {
  baseUrl = `${environment.apiBaseUrl}/api/orders`;

  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  createOrder(request: CreateOrderRequest): Observable<Order> {
    return this.http.post<Order>(this.baseUrl, request, this.auth.getAuthHeaders()).pipe(map((order) => this.normalizeOrder(order)));
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.baseUrl, this.auth.getAuthHeaders()).pipe(map((orders) => orders.map((order) => this.normalizeOrder(order))));
  }

  getOrder(orderId: number): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/${orderId}`, this.auth.getAuthHeaders()).pipe(map((order) => this.normalizeOrder(order)));
  }

  private normalizeOrder(order: Order): Order {
    const source = order as Order & Record<string, unknown>;
    const rawItems = (source['items'] || source['Items'] || []) as unknown as Array<Record<string, unknown>>;

    return {
      orderId: Number(source['orderId'] ?? source['OrderId'] ?? 0),
      userId: Number(source['userId'] ?? source['UserId'] ?? 0),
      userEmail: String(source['userEmail'] ?? source['UserEmail'] ?? ''),
      userName: String(source['userName'] ?? source['UserName'] ?? ''),
      orderDate: String(source['orderDate'] ?? source['OrderDate'] ?? ''),
      totalAmount: Number(source['totalAmount'] ?? source['TotalAmount'] ?? 0),
      items: rawItems.map((item) => ({
        productId: Number(item['productId'] ?? item['ProductId'] ?? 0),
        productName: String(item['productName'] ?? item['ProductName'] ?? ''),
        quantity: Number(item['quantity'] ?? item['Quantity'] ?? 0),
        price: Number(item['price'] ?? item['Price'] ?? 0),
        lineTotal: Number(item['lineTotal'] ?? item['LineTotal'] ?? 0)
      }))
    };
  }
}
