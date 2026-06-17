import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { CheckoutPageComponent } from './checkout-page.component';

describe('CheckoutPageComponent', () => {
  let component: CheckoutPageComponent;
  let fixture: ComponentFixture<CheckoutPageComponent>;
  let cartServiceSpy: jasmine.SpyObj<CartService>;
  let orderServiceSpy: jasmine.SpyObj<OrderService>;

  beforeEach(async () => {
    cartServiceSpy = jasmine.createSpyObj<CartService>('CartService', ['getCart', 'getSummary', 'clearCart']);
    orderServiceSpy = jasmine.createSpyObj<OrderService>('OrderService', ['createOrder']);
    cartServiceSpy.getCart.and.returnValue([]);
    cartServiceSpy.getSummary.and.returnValue({ itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 });
    orderServiceSpy.createOrder.and.returnValue(
      of({ orderId: 1, userId: 1, orderDate: '2026-05-11T00:00:00Z', totalAmount: 0, items: [] })
    );

    await TestBed.configureTestingModule({
      imports: [CheckoutPageComponent],
      providers: [
        provideRouter([]),
        { provide: CartService, useValue: cartServiceSpy },
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: OrderService, useValue: orderServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks form as touched and prevents API call when invalid', () => {
    component.placeOrder();
    expect(orderServiceSpy.createOrder).not.toHaveBeenCalled();
    expect(component.checkoutForm.touched).toBeTrue();
  });

  it('calls createOrder when form is valid and items exist', () => {
    cartServiceSpy.getCart.and.returnValue([
      { productId: 1, name: 'Item', price: 100, imageUrl: 'x', quantity: 1, stock: 10 }
    ]);
    cartServiceSpy.getSummary.and.returnValue({ itemCount: 1, subtotal: 100, shipping: 0, tax: 0, total: 100 });

    fixture = TestBed.createComponent(CheckoutPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.checkoutForm.setValue({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      address: 'Street 1',
      city: 'Pune',
      zip: '411001'
    });

    component.placeOrder();

    expect(orderServiceSpy.createOrder).toHaveBeenCalled();
  });
});
