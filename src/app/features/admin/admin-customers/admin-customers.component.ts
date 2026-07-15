import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe, NgClass, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BankingService } from '../../../shared/services/banking.service';
import { UserEntity } from '../../../shared/interfaces/banking.models';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-customers',
  imports: [NgClass, DatePipe, UpperCasePipe, CardElevationDirective, FormsModule],
  templateUrl: './admin-customers.component.html',
  styleUrl: './admin-customers.component.css'
})
export class AdminCustomersComponent {
  readonly bank = inject(BankingService);

  searchQuery = '';
  statusFilter = 'all';

  readonly selectedUser = signal<UserEntity | null>(null);
  readonly showAddModal = signal(false);

  newUserName = '';
  newUserEmail = '';
  newUserPhone = '';
  newUserPan = 'ABCDE1234F';

  readonly filteredUsers = computed(() => {
    const list = this.bank.usersList();
    const query = this.searchQuery.trim().toLowerCase();

    return list.filter((user) => {
      if (this.statusFilter !== 'all' && user.status !== this.statusFilter && user.kycStatus.toLowerCase() !== this.statusFilter) {
        return false;
      }
      if (query && !user.fullName.toLowerCase().includes(query) && !user.email.toLowerCase().includes(query) && !user.phone.includes(query)) {
        return false;
      }
      return true;
    });
  });


  viewUser(user: UserEntity): void {
    this.selectedUser.set(user);
  }

  closeViewModal(): void {
    this.selectedUser.set(null);
  }

  toggleLock(user: UserEntity): void {
    this.bank.toggleAccountLock(user.id);
    if (this.selectedUser()?.id === user.id) {
      const updated = this.bank.usersList().find((u) => u.id === user.id) || null;
      this.selectedUser.set(updated);
    }
  }

  resetUserPassword(user: UserEntity): void {
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert(`Password reset link and temporary MPIN dispatched to ${user.email}.`, 'info');
    } else {
      alert(`Password reset instructions dispatched to ${user.email}.`);
    }
  }

  openAddModal(): void {
    this.showAddModal.set(true);
  }

  closeAddModal(): void {
    this.showAddModal.set(false);
  }

  submitAddUser(): void {
    if (!this.newUserName || !this.newUserEmail || !this.newUserPhone) {
      alert('Please fill mandatory fields.');
      return;
    }

    this.bank.registerUser({
      fullName: this.newUserName,
      email: this.newUserEmail,
      phone: this.newUserPhone,
      aadhaar: '444455556666',
      pan: this.newUserPan.toUpperCase(),
      dob: '1995-01-01',
      gender: 'Male',
      address: { street: '12, Tech Park', city: 'Bengaluru', state: 'Karnataka', pincode: '560100' },
      username: this.newUserEmail.split('@')[0],
      passwordPlain: 'password123'
    });

    this.closeAddModal();
    this.newUserName = '';
    this.newUserEmail = '';
    this.newUserPhone = '';
  }
}
