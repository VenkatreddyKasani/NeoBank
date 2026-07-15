import { Component, computed, inject, signal } from '@angular/core';
import { NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../../shared/services/banking.service';
import { Account } from '../../../shared/interfaces/banking.models';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-accounts',
  imports: [NgClass, UpperCasePipe, InrPipe, CardElevationDirective, FormsModule],
  templateUrl: './admin-accounts.component.html',
  styleUrl: './admin-accounts.component.css'
})
export class AdminAccountsComponent {
  readonly bank = inject(BankingService);

  searchQuery = '';
  typeFilter = 'all';
  statusFilter = 'all';

  readonly selectedAccount = signal<Account | null>(null);
  readonly showCreateModal = signal(false);

  newAccHolder = 'Venkat Raman';
  newAccHolderId = 'NEO-894210';
  newAccName = 'Corporate Salary Vault';
  newAccType: 'Savings' | 'Current' | 'Salary' | 'Joint' = 'Salary';
  newAccDeposit = 50000;

  readonly filteredAccounts = computed(() => {
    const list = this.bank.accountsList();
    const query = this.searchQuery.trim().toLowerCase();

    return list.filter((acc) => {
      if (this.typeFilter !== 'all' && acc.accountType !== this.typeFilter && !acc.type.toLowerCase().includes(this.typeFilter.toLowerCase())) {
        return false;
      }
      if (this.statusFilter !== 'all' && acc.status !== this.statusFilter) {
        return false;
      }
      if (query && !acc.name.toLowerCase().includes(query) && !acc.number.includes(query) && !(acc.holderName || '').toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  });

  readonly totalSystemDeposits = computed(() => {
    return this.bank.accountsList().reduce((sum, acc) => sum + (acc.balance || 0), 0);
  });

  viewAccount(acc: Account): void {
    this.selectedAccount.set(acc);
  }

  closeViewModal(): void {
    this.selectedAccount.set(null);
  }

  toggleFreeze(acc: Account): void {

    this.bank.toggleAccountFreeze(acc.id);
    if (this.selectedAccount()?.id === acc.id) {
      const updated = this.bank.accountsList().find((a) => a.id === acc.id) || null;
      this.selectedAccount.set(updated);
    }
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  submitCreateAccount(): void {
    if (this.newAccDeposit < 0) {
      alert('Please enter valid deposit.');
      return;
    }

    this.bank.createBankAccount({
      name: this.newAccName,
      type: `${this.newAccType} Account`,
      number: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: this.newAccDeposit,
      color: this.newAccType === 'Savings' ? 'blue' : this.newAccType === 'Current' ? 'violet' : 'green',
      status: 'active',
      holderName: this.newAccHolder,
      holderId: this.newAccHolderId,
      accountType: this.newAccType
    });

    this.closeCreateModal();
  }
}
