import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Product } from '../../models';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { ProductsPageComponent } from './products-page.component';

describe('ProductsPageComponent', () => {
  let component: ProductsPageComponent;
  let fixture: ComponentFixture<ProductsPageComponent>;

  const products: Product[] = [
    { id: 1, name: 'Test Product', description: 'Test description', price: 100, imageUrl: 'images/test.jpg', stock: 5, category: 'Electronics' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProductService,
          useValue: {
            loadProducts: () => of(products),
            getCategories: (items: Product[]) => Array.from(new Set(items.map((product) => product.category || 'General')))
          }
        },
        { provide: CartService, useValue: { addToCart: () => undefined } },
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: ToastService, useValue: { show: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
