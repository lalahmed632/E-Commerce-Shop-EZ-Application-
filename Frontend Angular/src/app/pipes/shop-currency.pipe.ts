import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shopCurrency',
  standalone: true
})
export class ShopCurrencyPipe implements PipeTransform {
  transform(amount: number): string {
    return 'Rs ' + Number(amount || 0).toFixed(2);
  }
}
