import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-payments',
  imports: [ReactiveFormsModule, NgClass, InrPipe],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent {
  private readonly fb = inject(FormBuilder);
  readonly bank = inject(BankingService);

  readonly activeTab = signal<'upi' | 'bills' | 'recharge'>('upi');
  readonly showQrScanner = signal(false);
  readonly scannedMerchant = signal<{ name: string; upi: string; amount: number; icon: string } | null>(null);

  readonly quickPayments = [
    { name: 'Electricity', icon: 'bi-lightning-charge', color: 'amber', due: 'Due 22 Jul', defaultAmount: 1725 },
    { name: 'Mobile recharge', icon: 'bi-phone', color: 'blue', due: 'Due 28 Jul', defaultAmount: 599 },
    { name: 'Broadband', icon: 'bi-wifi', color: 'violet', due: 'Due 18 Jul', defaultAmount: 999 },
    { name: 'Gas & Water', icon: 'bi-droplet', color: 'cyan', due: 'Due 30 Jul', defaultAmount: 840 }
  ];

  readonly rechargePlans = [
    { operator: 'Jio Prepaid', price: 299, validity: '28 Days', data: '1.5GB/Day + Unlimited Calls', tag: 'Bestseller' },
    { operator: 'Airtel Prepaid', price: 749, validity: '84 Days', data: '2.0GB/Day + Prime Video', tag: 'Value' },
    { operator: 'Vi Postpaid', price: 499, validity: 'Monthly Cycle', data: '75GB Rollover + Unlimited Calls', tag: 'Popular' },
    { operator: 'Jio Annual', price: 2999, validity: '365 Days', data: '2.5GB/Day + Hotstar', tag: 'Annual Saver' }
  ];

  readonly upiForm = this.fb.nonNullable.group({
    upiId: ['', [Validators.required, Validators.pattern(/.+@.+/)]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]]
  });

  setTab(tab: 'upi' | 'bills' | 'recharge'): void {
    this.activeTab.set(tab);
  }

  payUpi(): void {
    if (this.upiForm.invalid) {
      this.upiForm.markAllAsTouched();
      return;
    }
    const value = this.upiForm.getRawValue();
    if (this.bank.sendMoney(value.amount!, value.upiId, 'UPI payment')) {
      this.upiForm.reset({ upiId: '', amount: null });
    }
  }

  payBill(name: string, amount: number): void {
    this.bank.sendMoney(amount, `${name} Utility Bill`, 'Utilities');
  }

  payRecharge(plan: { operator: string; price: number; data: string }): void {
    this.bank.sendMoney(plan.price, `${plan.operator} (${plan.data})`, 'Recharge');
  }

  openScanner(): void {
    this.showQrScanner.set(true);
    this.scannedMerchant.set(null);
  }

  closeScanner(): void {
    this.showQrScanner.set(false);
    this.scannedMerchant.set(null);
  }

  simulateScan(merchant: { name: string; upi: string; amount: number; icon: string }): void {
    this.scannedMerchant.set(merchant);
  }

  confirmQrPayment(): void {
    const m = this.scannedMerchant();
    if (m) {
      this.bank.sendMoney(m.amount, m.name, 'QR Merchant Payment');
      this.closeScanner();
    }
  }
}
