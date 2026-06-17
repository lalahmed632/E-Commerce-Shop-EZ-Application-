import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ToastService } from '../../services/toast.service';
import { CartPageComponent } from './cart-page.component';

describe('CartPageComponent', () => {
  let component: CartPageComponent;
  let fixture: ComponentFixture<CartPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: {
            getCart: () => [],
            getSummary: () => ({ itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 }),
            updateQuantity: () => undefined,
            removeFromCart: () => undefined,
            clearCart: () => undefined
          }
        },
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: ToastService, useValue: { show: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CartPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
