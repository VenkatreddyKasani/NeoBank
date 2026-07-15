import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankingService } from '../../../shared/services/banking.service';
import { UserRole } from '../../../shared/interfaces/banking.models';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  readonly bank = inject(BankingService);
  private readonly router = inject(Router);

  role: UserRole = 'user';
  email = 'venkat@neobank.com';
  password = 'password123';
  remember = true;
  showPassword = false;

  readonly submitted = signal(false);
  readonly isLoggingIn = signal(false);
  readonly errorMessage = signal<string | null>(null);

  onRoleChange(newRole: UserRole): void {
    this.role = newRole;
    this.errorMessage.set(null);
    if (newRole === 'admin') {
      this.email = 'admin@neobank.com';
      this.password = 'admin123';
    } else {
      this.email = 'venkat@neobank.com';
      this.password = 'password123';
    }
  }

  signIn(): void {
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (!this.email || !this.password) {
      this.errorMessage.set('Please provide both your email and password.');
      return;
    }

    this.isLoggingIn.set(true);

    // Simulate network authentication spinner delay
    setTimeout(() => {
      const result = this.bank.authenticate(this.role, this.email, this.password, this.remember);
      this.isLoggingIn.set(false);

      if (result.success && result.response) {
        if (result.response.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
      } else {
        this.errorMessage.set(result.message);
      }
    }, 800);
  }

  triggerForgotPassword(): void {
    if (!this.email) {
      this.errorMessage.set('Please enter your registered email address first to reset password.');
    } else {
      this.bank['pushAlert'] ? (this.bank as any).pushAlert(`Password reset instructions sent to ${this.email}`, 'info') : alert(`Password reset instructions sent to ${this.email}`);
      this.errorMessage.set(null);
    }
  }
}
