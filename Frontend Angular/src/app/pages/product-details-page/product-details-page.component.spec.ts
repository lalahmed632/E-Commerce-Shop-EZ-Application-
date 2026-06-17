import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Product } from '../../models';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { ToastService } from '../../services/toast.service';
import { ProductDetailsPageComponent } from './product-details-page.component';

describe('ProductDetailsPageComponent', () => {
  let component: ProductDetailsPageComponent;
  let fixture: ComponentFixture<ProductDetailsPageComponent>;

  const product: Product = {
    id: 1,
    name: 'Test Product',
    description: 'Test description',
    price: 100,
    imageUrl: 'images/test.jpg',
    stock: 5,
    category: 'Electronics'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsPageComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '1' }) } } },
        { provide: ProductService, useValue: { getById: () => of(product) } },
        { provide: CartService, useValue: { addToCart: () => undefined } },
        { provide: AuthService, useValue: { isLoggedIn: () => true, isAdmin: () => false } },
        { provide: ToastService, useValue: { show: () => undefined } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
