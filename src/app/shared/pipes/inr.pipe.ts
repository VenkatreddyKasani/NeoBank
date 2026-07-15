import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'inr', standalone: true })
export class InrPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = '1.0-0'): string {
    const fractionDigits = digits.includes('2') ? 2 : 0;
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(value ?? 0);
  }
}
