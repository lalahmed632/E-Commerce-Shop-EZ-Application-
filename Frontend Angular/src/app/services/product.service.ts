import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product, ProductUpsert } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProductService {
  baseUrl = `${environment.apiBaseUrl}/api/products`;

  constructor(private readonly http: HttpClient, private readonly auth: AuthService) {}

  loadProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.baseUrl).pipe(
      map((products) => this.normalize(products))
    );
  }

  getById(productId: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/${productId}`).pipe(
      map((product) => this.normalizeOne(product))
    );
  }

  getCategories(products: Product[]): string[] {
    return Array.from(new Set(products.map((product) => product.category || 'General'))).sort();
  }

  createProduct(product: ProductUpsert): Observable<Product> {
    return this.http.post<Product>(this.baseUrl, product, this.auth.getAuthHeaders()).pipe(map((created) => this.normalizeOne(created)));
  }

  updateProduct(productId: number, product: ProductUpsert): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${productId}`, product, this.auth.getAuthHeaders());
  }

  deleteProduct(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`, this.auth.getAuthHeaders());
  }

  private normalize(products: Product[]): Product[] {
    if (!Array.isArray(products)) {
      return [];
    }

    return products.map((item) => this.normalizeOne(item));
  }

  private normalizeOne(item: Product): Product {
    const source = item as Product & Record<string, unknown>;
    const rawImageUrl = String(source['imageUrl'] || source['imageURL'] || source['image'] || '');
    const rawCategory = String(source['category'] || source['categoryName'] || source['productCategory'] || 'General');

    return {
      id: Number(source['productId'] ?? source['id']),
      productId: Number(source['productId'] ?? source['id']),
      name: String(source['name'] || ''),
      category: rawCategory,
      price: Number(source['price'] || 0),
      description: String(source['description'] || ''),
      imageUrl: this.getSafeImageUrl(rawImageUrl),
      stock: Math.max(0, Math.floor(Number(source['stock']) || 0))
    };
  }

  private getSafeImageUrl(imageUrl: string): string {
    const url = imageUrl.trim();

    if (!url) {
      return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    return url.startsWith('/') ? url.slice(1) : url;
  }
}
