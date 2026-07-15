import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';
import { Transaction } from '../../shared/interfaces/banking.models';
import { InrPipe } from '../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-transactions',
  imports: [ReactiveFormsModule, DatePipe, NgClass, InrPipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly bank = inject(BankingService);

  readonly mode = signal<'send' | 'add' | 'withdraw'>('send');
  readonly search = signal('');
  readonly category = signal('All');
  readonly sortNewest = signal(true);
  readonly selectedReceipt = signal<Transaction | null>(null);

  readonly filteredTransactions = computed(() => {
    const term = this.search().trim().toLowerCase();
    const category = this.category();
    return this.bank.transactions()
      .filter((item) => (category === 'All' || item.category === category) &&
                        (!term || item.merchant.toLowerCase().includes(term) || item.category.toLowerCase().includes(term)))
      .sort((a, b) => this.sortNewest() ? b.date.getTime() - a.date.getTime() : a.date.getTime() - b.date.getTime());
  });

  readonly transferForm = this.formBuilder.nonNullable.group({
    recipient: ['', [Validators.required, Validators.minLength(2)]],
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    note: ['']
  });

  readonly addMoneyForm = this.formBuilder.nonNullable.group({
    source: ['Salary account', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(100)]]
  });

  readonly withdrawForm = this.formBuilder.nonNullable.group({
    destination: ['HDFC Bank Linked Account', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(100)]],
    note: ['']
  });

  readonly categories = ['All', 'Income', 'Food & dining', 'Home', 'Transfer', 'Subscriptions', 'Utilities', 'Deposit', 'Withdrawal'];

  setMode(mode: 'send' | 'add' | 'withdraw'): void {
    this.mode.set(mode);
  }

  onSearch(value: string): void {
    this.search.set(value);
  }

  setCategory(value: string): void {
    this.category.set(value);
  }

  toggleSort(): void {
    this.sortNewest.update((value) => !value);
  }

  openReceipt(item: Transaction): void {
    this.selectedReceipt.set(item);
  }

  closeReceipt(): void {
    this.selectedReceipt.set(null);
  }

  downloadReceipt(): void {
    this.bank.addMoney(0, 'Receipt downloaded successfully');
    this.closeReceipt();
  }

  sendMoney(): void {
    if (this.transferForm.invalid) {
      this.transferForm.markAllAsTouched();
      return;
    }
    const value = this.transferForm.getRawValue();
    if (this.bank.sendMoney(value.amount!, value.recipient)) {
      this.transferForm.reset({ recipient: '', amount: null, note: '' });
    }
  }

  addMoney(): void {
    if (this.addMoneyForm.invalid) {
      this.addMoneyForm.markAllAsTouched();
      return;
    }
    const value = this.addMoneyForm.getRawValue();
    this.bank.addMoney(value.amount!, value.source);
    this.addMoneyForm.reset({ source: 'Salary account', amount: null });
  }

  withdrawMoney(): void {
    if (this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }
    const value = this.withdrawForm.getRawValue();
    if (this.bank.withdrawMoney(value.amount!, value.destination)) {
      this.withdrawForm.reset({ destination: 'HDFC Bank Linked Account', amount: null, note: '' });
    }
  }
}
