import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({ selector: 'app-cards', imports: [NgClass, InrPipe], templateUrl: './cards.component.html', styleUrl: './cards.component.css' })
export class CardsComponent {
  readonly bank = inject(BankingService);
  readonly detailsVisible = signal(false);
  readonly spendingLimit = signal(25000);
  toggleDetails(): void { this.detailsVisible.update((value) => !value); }
  updateLimit(amount: number): void { this.spendingLimit.set(amount); this.bank.addMoney(0, 'Card spending limit updated'); }
}
