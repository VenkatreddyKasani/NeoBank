import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankingService } from '../../../shared/services/banking.service';
import { Address } from '../../../shared/interfaces/banking.models';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly bank = inject(BankingService);
  private readonly router = inject(Router);

  fullName = '';
  email = '';
  phone = '';
  aadhaar = '';
  pan = '';
  dob = '1996-05-15';
  gender: 'Male' | 'Female' | 'Other' = 'Male';
  username = '';
  password = '';
  confirmPassword = '';

  address: Address = {
    street: '101, Residency Towers',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560102',
    type: 'Residential'
  };

  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly registrationSuccess = signal(false);

  validateAadhaar(val: string): boolean {
    const clean = val.replace(/\s+/g, '');
    return /^[0-9]{12}$/.test(clean);
  }

  validatePan(val: string): boolean {
    const clean = val.trim().toUpperCase();
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(clean);
  }

  submitRegistration(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    // Basic required check
    if (!this.fullName || !this.email || !this.phone || !this.aadhaar || !this.pan || !this.dob || !this.username || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Please fill in all mandatory fields.');
      return;
    }

    if (!this.validateAadhaar(this.aadhaar)) {
      this.errorMessage.set('Aadhaar Number must be exactly 12 digits.');
      return;
    }

    if (!this.validatePan(this.pan)) {
      this.errorMessage.set('PAN Number format must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).');
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage.set('Password must be at least 8 characters long.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please verify.');
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      const result = this.bank.registerUser({
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        aadhaar: this.aadhaar.replace(/\s+/g, ''),
        pan: this.pan.toUpperCase(),
        dob: this.dob,
        gender: this.gender,
        address: this.address,
        username: this.username,
        passwordPlain: this.password
      });

      this.isSubmitting.set(false);

      if (result.success) {
        this.registrationSuccess.set(true);
      } else {
        this.errorMessage.set(result.message);
      }
    }, 900);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
