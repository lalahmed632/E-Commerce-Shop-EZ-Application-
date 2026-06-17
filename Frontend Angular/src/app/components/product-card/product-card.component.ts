import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models';
import { StockStatusDirective } from '../../directives/stock-status.directive';
import { ShopCurrencyPipe } from '../../pipes/shop-currency.pipe';
import { getCategoryClass } from '../../shared/product-ui';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, ShopCurrencyPipe, StockStatusDirective],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();
  categoryClass(): string {
    return getCategoryClass(this.product.category || 'General');
  }
}
