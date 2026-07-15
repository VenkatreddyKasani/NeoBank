import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../../shared/services/banking.service';
import { InrPipe } from '../../../shared/pipes/inr.pipe';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-transactions',
  imports: [NgClass, DatePipe, UpperCasePipe, InrPipe, CardElevationDirective, FormsModule],
  templateUrl: './admin-transactions.component.html',
  styleUrl: './admin-transactions.component.css'
})
export class AdminTransactionsComponent {
  readonly bank = inject(BankingService);

  searchQuery = '';
  typeFilter = 'all';
  statusFilter = 'all';

  readonly filteredTxns = computed(() => {
    const list = this.bank.transactions();
    const query = this.searchQuery.trim().toLowerCase();

    return list.filter((txn) => {
      if (this.typeFilter !== 'all' && txn.type !== this.typeFilter) return false;
      if (this.statusFilter !== 'all' && txn.status.toLowerCase() !== this.statusFilter) return false;
      if (query && !txn.merchant.toLowerCase().includes(query) && !txn.id.toLowerCase().includes(query) && !txn.category.toLowerCase().includes(query)) {
        return false;
      }
      return true;
    });
  });
}
