import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { ToastService } from './services/toast.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        {
          provide: CartService,
          useValue: {
            items$: of([]),
            getCart: () => [],
            getSummary: () => ({ itemCount: 0, subtotal: 0, shipping: 0, tax: 0, total: 0 })
          }
        },
        { provide: ToastService, useValue: { messages: [] } },
        { provide: AuthService, useValue: { isLoggedIn: () => false, isAdmin: () => false, logout: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
