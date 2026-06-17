import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Product, ProductUpsert } from '../../models';
import { getCategoryClass } from '../../shared/product-ui';
import { getApiErrorMessage } from '../../services/api-error';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-products-page.component.html',
  styleUrl: './admin-products-page.component.css'
})
export class AdminProductsPageComponent implements OnInit {
  products: Product[] = [];
  editingId: number | null = null;
  busy = false;
  error = '';
  message = '';
  form: ProductUpsert = this.emptyForm();

  constructor(
    private readonly productService: ProductService,
    readonly cart: CartService
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  save(): void {
    this.form.name = this.form.name.trim();
    this.form.description = this.form.description.trim();
    this.form.imageUrl = this.form.imageUrl.trim();
    this.form.category = this.form.category.trim();
    this.busy = true;
    this.error = '';
    this.message = '';
    const request = { ...this.form, price: Number(this.form.price), stock: Number(this.form.stock) };

    if (this.editingId) {
      this.productService.updateProduct(this.editingId, request).subscribe({
        next: () => this.afterSave('Product updated.'),
        error: (error) => this.showSaveError(error)
      });
    } else {
      this.productService.createProduct(request).subscribe({
        next: () => this.afterSave('Product created.'),
        error: (error) => this.showSaveError(error)
      });
    }
  }

  edit(product: Product): void {
    this.editingId = product.id;
    this.form = {
      name: product.name,
      description: product.description,
      category: product.category || 'General',
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(productId: number): void {
    const shouldDelete = window.confirm('Delete this product permanently?');
    if (!shouldDelete) {
      return;
    }

    this.busy = true;
    this.error = '';
    this.message = '';
    this.productService.deleteProduct(productId).subscribe({
      next: () => {
        this.message = 'Product deleted.';
        this.loadProducts();
        this.busy = false;
      },
      error: (error) => {
        this.error = `Delete failed: ${getApiErrorMessage(error)}`;
        this.busy = false;
      }
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form = this.emptyForm();
  }

  private loadProducts(): void {
    this.productService.loadProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        this.error = `Load failed: ${getApiErrorMessage(error)}`;
        this.busy = false;
      }
    });
  }

  private afterSave(message: string): void {
    this.message = message;
    this.resetForm();
    this.loadProducts();
    this.busy = false;
  }

  private showSaveError(error: unknown): void {
    this.error = `Save failed: ${getApiErrorMessage(error)}`;
    this.busy = false;
  }

  private emptyForm(): ProductUpsert {
    return {
      name: '',
      description: '',
      category: 'Electronics',
      price: 1,
      imageUrl: 'images/',
      stock: 0
    };
  }

  categoryClass(category: string): string {
    return getCategoryClass(category || 'General');
  }
}
