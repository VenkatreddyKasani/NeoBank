import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { BankingService } from '../../../shared/services/banking.service';
import { UserEntity } from '../../../shared/interfaces/banking.models';
import { CardElevationDirective } from '../../../shared/directives/card-elevation.directive';

@Component({
  selector: 'app-admin-kyc',
  imports: [DatePipe, CardElevationDirective],
  templateUrl: './admin-kyc.component.html',
  styleUrl: './admin-kyc.component.css'
})
export class AdminKycComponent {
  readonly bank = inject(BankingService);

  readonly pendingKycUsers = computed(() => {
    return this.bank.usersList().filter((u) => u.kycStatus === 'Pending');
  });

  readonly verifiedKycUsers = computed(() => {
    return this.bank.usersList().filter((u) => u.kycStatus === 'Verified');
  });

  approveKyc(user: UserEntity): void {
    this.bank.updateUserKycStatus(user.id, 'Verified');
  }

  rejectKyc(user: UserEntity): void {
    this.bank.updateUserKycStatus(user.id, 'Pending');
  }
}
