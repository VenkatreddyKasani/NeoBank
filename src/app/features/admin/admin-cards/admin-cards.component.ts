import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { BankingService } from '../../../shared/services/banking.service';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

interface SystemCard {
  id: string;
  cardNumber: string;
  holderName: string;
  customerId: string;
  type: 'Virtual VISA' | 'Physical Mastercard';
  limit: number;
  status: 'active' | 'frozen';
}

@Component({
  selector: 'app-admin-cards',
  imports: [NgClass, CardElevationDirective],
  templateUrl: './admin-cards.component.html',
  styleUrl: './admin-cards.component.css'
})
export class AdminCardsComponent {
  readonly bank = inject(BankingService);

  readonly cardsList = signal<SystemCard[]>([
    { id: 'CRD-101', cardNumber: '•••• •••• •••• 4821', holderName: 'Venkat Raman', customerId: 'NEO-894210', type: 'Virtual VISA', limit: 150000, status: 'active' },
    { id: 'CRD-102', cardNumber: '•••• •••• •••• 8912', holderName: 'Ananya Sharma', customerId: 'NEO-784102', type: 'Physical Mastercard', limit: 300000, status: 'active' },
    { id: 'CRD-103', cardNumber: '•••• •••• •••• 3341', holderName: 'Vikram Aditya', customerId: 'NEO-651092', type: 'Virtual VISA', limit: 100000, status: 'frozen' },
    { id: 'CRD-104', cardNumber: '•••• •••• •••• 9924', holderName: 'Sneha Kapoor', customerId: 'NEO-902184', type: 'Virtual VISA', limit: 200000, status: 'active' }
  ]);

  toggleCardStatus(card: SystemCard): void {
    const nextStatus = card.status === 'active' ? 'frozen' : 'active';
    this.cardsList.update((list) => list.map((c) => (c.id === card.id ? { ...c, status: nextStatus } : c)));
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert(`Card ${card.cardNumber} status changed to ${nextStatus.toUpperCase()}.`, nextStatus === 'active' ? 'success' : 'info');
    }
  }
}
