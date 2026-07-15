import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BankingService } from '../../shared/services/banking.service';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private readonly fb = inject(FormBuilder);
  readonly bank = inject(BankingService);

  readonly activeSection = signal<'personal' | 'address' | 'nominee' | 'security' | 'chequebook'>('personal');

  readonly profileForm = this.fb.nonNullable.group({
    name: [this.bank.profile().name, [Validators.required, Validators.minLength(2)]],
    email: [this.bank.profile().email, [Validators.required, Validators.email]],
    phone: [this.bank.profile().phone, Validators.required],
    occupation: ['Senior Software Engineer', Validators.required],
    panNumber: [this.bank.profile().pan || 'ABCDE1234F', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]]
  });

  readonly addressForm = this.fb.nonNullable.group({
    street: [this.bank.profile().address?.street || '402, Horizon Towers, MG Road', Validators.required],
    city: [this.bank.profile().address?.city || 'Bengaluru', Validators.required],
    state: [this.bank.profile().address?.state || 'Karnataka', Validators.required],
    pincode: [this.bank.profile().address?.pincode || '560001', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
  });

  readonly nomineeForm = this.fb.nonNullable.group({
    name: [this.bank.profile().nominee?.name || 'Priya Mehta', Validators.required],
    relationship: [this.bank.profile().nominee?.relationship || 'Spouse', Validators.required],
    dob: [this.bank.profile().nominee?.dob || '1996-11-20', Validators.required]
  });

  readonly passwordForm = this.fb.nonNullable.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmNewPassword: ['', Validators.required]
  });

  readonly chequeBookLeaves = signal<'25' | '50' | '100'>('25');
  readonly chequeBookStatus = signal<string | null>(null);

  constructor() {
    effect(() => {
      const p = this.bank.profile();
      this.profileForm.patchValue({
        name: p.name,
        email: p.email,
        phone: p.phone,
        panNumber: p.pan || 'ABCDE1234F'
      }, { emitEvent: false });

      if (p.address) {
        this.addressForm.patchValue(p.address, { emitEvent: false });
      }
      if (p.nominee) {
        this.nomineeForm.patchValue(p.nominee, { emitEvent: false });
      }
    });
  }

  setSection(sec: 'personal' | 'address' | 'nominee' | 'security' | 'chequebook'): void {
    this.activeSection.set(sec);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const current = this.bank.profile();
    const value = this.profileForm.getRawValue();
    this.bank.updateProfile({
      ...current,
      name: value.name,
      email: value.email,
      phone: value.phone,
      pan: value.panNumber,
      initials: value.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    });
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert('Personal details updated successfully', 'success');
    }
  }

  saveAddress(): void {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    const current = this.bank.profile();
    const value = this.addressForm.getRawValue();
    this.bank.updateProfile({
      ...current,
      address: value
    });
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert('Registered residential address updated', 'success');
    }
  }

  saveNominee(): void {
    if (this.nomineeForm.invalid) {
      this.nomineeForm.markAllAsTouched();
      return;
    }
    const current = this.bank.profile();
    const value = this.nomineeForm.getRawValue();
    this.bank.updateProfile({
      ...current,
      nominee: value
    });
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert('Account nominee declaration saved', 'success');
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const val = this.passwordForm.getRawValue();
    if (val.newPassword !== val.confirmNewPassword) {
      alert('New passwords do not match. Please re-enter.');
      return;
    }
    this.passwordForm.reset();
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert('Your password has been changed securely. Please use your new password on next login.', 'success');
    } else {
      alert('Your password has been changed successfully.');
    }
  }

  setChequeLeaves(leaves: '25' | '50' | '100'): void {
    this.chequeBookLeaves.set(leaves);
  }

  requestChequeBook(): void {
    this.chequeBookStatus.set(`Your request for a ${this.chequeBookLeaves()}-leaf personalized cheque book has been dispatched to ${this.bank.profile().address?.street}, ${this.bank.profile().address?.city}. Expected delivery within 4 working days.`);
    if (this.bank['pushAlert']) {
      (this.bank as any).pushAlert(`Cheque book request confirmed. Tracking ID: CQ-${Math.floor(10000 + Math.random() * 90000)}`, 'success');
    }
  }
}
