import { Directive, HostBinding, Input } from '@angular/core';

@Directive({
  selector: '[appStockStatus]',
  standalone: true
})
export class StockStatusDirective {
  @Input({ required: true }) appStockStatus = 0;

  @HostBinding('class.text-danger')
  get outOfStock(): boolean {
    return this.appStockStatus <= 0;
  }

  @HostBinding('class.text-success')
  get inStock(): boolean {
    return this.appStockStatus > 0;
  }
}
