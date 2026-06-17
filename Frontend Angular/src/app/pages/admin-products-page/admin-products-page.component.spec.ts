import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AdminProductsPageComponent } from './admin-products-page.component';

describe('AdminProductsPageComponent', () => {
  let component: AdminProductsPageComponent;
  let fixture: ComponentFixture<AdminProductsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsPageComponent],
      providers: [
        { provide: ProductService, useValue: { loadProducts: () => of([]) } },
        { provide: CartService, useValue: { formatCurrency: (amount: number) => 'Rs ' + Number(amount || 0).toFixed(2) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
