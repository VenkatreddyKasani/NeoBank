import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BankingService } from '../../../shared/services/banking.service';
import { CreatedAccountResult, OnboardingApplication } from '../../../shared/interfaces/banking.models';
import { InrPipe } from '../../../shared/pipes/inr.pipe';

@Component({
  selector: 'app-open-account',
  imports: [FormsModule, RouterLink, DatePipe, InrPipe],
  templateUrl: './open-account.component.html',
  styleUrl: './open-account.component.css'
})
export class OpenAccountComponent {
  readonly bank = inject(BankingService);
  private readonly router = inject(Router);

  readonly currentStep = signal(1);
  readonly totalSteps = 6;
  readonly isSubmitting = signal(false);
  readonly createdResult = signal<CreatedAccountResult | null>(null);

  // Form Data Model
  accountType: 'Savings Account' | 'Current Account' | 'Salary Account' = 'Savings Account';
  fullName = 'Rohit Verma';
  email = 'rohit.verma@email.com';
  phone = '+91 98112 33445';
  dob = '1998-04-12';
  pan = 'ABCDE9876G';
  aadhaar = '7890 1234 5678';

  // Address
  street = '104, Emerald Heights, Cyber City';
  city = 'Gurugram';
  state = 'Haryana';
  pincode = '122002';

  // KYC Files (UI simulation)
  aadhaarFile = 'Aadhaar_Card_Front_Back.pdf';
  panFile = 'PAN_Card_Copy.jpg';
  aadhaarUploaded = true;
  panUploaded = true;

  // Branch & Nominee
  branch = 'Bengaluru Tech Park';
  readonly branches = [
    'Bengaluru Tech Park (Primary Hub)',
    'Mumbai Central Financial District',
    'New Delhi Connaught Place',
    'Hyderabad Hitec City',
    'Pune Kalyani Nagar'
  ];

  nomineeName = 'Anjali Verma';
  nomineeRel = 'Sister';
  nomineeDob = '2001-08-19';
  nomineePhone = '+91 98112 99887';

  // Initial Deposit
  initialDeposit = 10000;
  depositSource = 'UPI Instant Transfer';
  readonly depositAmounts = [5000, 10000, 25000, 50000];

  selectAccountType(type: 'Savings Account' | 'Current Account' | 'Salary Account'): void {
    this.accountType = type;
  }

  selectDeposit(amount: number): void {
    this.initialDeposit = amount;
  }

  onFileChange(type: 'aadhaar' | 'pan', event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (type === 'aadhaar') {
        this.aadhaarFile = input.files[0].name;
        this.aadhaarUploaded = true;
      } else {
        this.panFile = input.files[0].name;
        this.panUploaded = true;
      }
    }
  }

  simulateUpload(type: 'aadhaar' | 'pan'): void {
    if (type === 'aadhaar') {
      this.aadhaarUploaded = true;
      this.aadhaarFile = 'Aadhaar_Digital_Verified.pdf';
    } else {
      this.panUploaded = true;
      this.panFile = 'PAN_Card_Verified.png';
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep() || step === 1) {
      this.currentStep.set(step);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  submitApplication(): void {
    this.isSubmitting.set(true);
    setTimeout(() => {
      const payload: OnboardingApplication = {
        accountType: this.accountType,
        fullName: this.fullName,
        email: this.email,
        phone: this.phone,
        dob: this.dob,
        pan: this.pan,
        aadhaar: this.aadhaar,
        address: {
          street: this.street,
          city: this.city,
          state: this.state,
          pincode: this.pincode,
          type: 'Residential'
        },
        branch: this.branch,
        nominee: {
          name: this.nomineeName,
          relationship: this.nomineeRel,
          dob: this.nomineeDob,
          phone: this.nomineePhone
        },
        initialDeposit: Number(this.initialDeposit),
        depositSource: this.depositSource
      };

      const result = this.bank.submitOnboarding(payload);
      this.createdResult.set(result);
      this.isSubmitting.set(false);
      this.currentStep.set(7); // Step 7 is the Success Screen
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  proceedToLogin(): void {
    this.router.navigate(['/login']);
  }
}
