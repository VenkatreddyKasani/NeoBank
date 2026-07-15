import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  Account,
  AccountStatus,
  Address,
  AlertMessage,
  CreatedAccountResult,
  JwtAuthResponse,
  LoanApplication,
  OnboardingApplication,
  Transaction,
  UserEntity,
  UserProfile,
  UserRole
} from '../interfaces/banking.models';



@Injectable({ providedIn: 'root' })
export class BankingService {
  private readonly router = inject(Router);

  // Core Transactions State
  private readonly transactionState = signal<Transaction[]>([
    { id: 'txn-001', merchant: 'Salary deposit', category: 'Income', date: new Date('2026-07-14'), amount: 82500, type: 'credit', icon: 'bi-wallet2', status: 'Completed', accountId: 'primary', senderOrRecipient: 'TechCorp India Pvt Ltd' },
    { id: 'txn-002', merchant: 'Urban Company', category: 'Home', date: new Date('2026-07-13'), amount: 1299, type: 'debit', icon: 'bi-house-heart', status: 'Completed', accountId: 'primary', senderOrRecipient: 'UrbanClap Services' },
    { id: 'txn-003', merchant: 'Swiggy', category: 'Food & dining', date: new Date('2026-07-12'), amount: 486, type: 'debit', icon: 'bi-bag', status: 'Completed', accountId: 'primary', senderOrRecipient: 'Swiggy Gourmet' },
    { id: 'txn-004', merchant: 'Microsoft 365', category: 'Subscriptions', date: new Date('2026-07-10'), amount: 689, type: 'debit', icon: 'bi-cloud-check', status: 'Completed', accountId: 'primary', senderOrRecipient: 'Microsoft Cloud' },
    { id: 'txn-005', merchant: 'Riya Sharma', category: 'Transfer', date: new Date('2026-07-09'), amount: 3200, type: 'credit', icon: 'bi-person-check', status: 'Completed', accountId: 'growth', senderOrRecipient: 'Riya Sharma (Sister)' },
    { id: 'txn-006', merchant: 'Tata Power', category: 'Utilities', date: new Date('2026-07-07'), amount: 1725, type: 'debit', icon: 'bi-lightning-charge', status: 'Completed', accountId: 'primary', senderOrRecipient: 'Tata Power Electricity' }
  ]);

  private readonly balanceState = signal(128450.75);
  private readonly cardFrozenState = signal(false);
  private readonly alertsState = signal<AlertMessage[]>([]);
  private readonly createdAccountState = signal<CreatedAccountResult | null>(null);

  // Authentication & Role State
  private readonly loggedInState = signal<boolean>(this.checkInitialLogin());
  private readonly roleState = signal<UserRole | null>(this.checkInitialRole());
  private readonly tokenState = signal<string | null>(this.checkInitialToken());
  private readonly sessionUserState = signal<UserEntity | null>(this.checkInitialSessionUser());

  // Database Mock: Users Table
  private readonly usersState = signal<UserEntity[]>([
    {
      id: 'usr-admin-01',
      role: 'admin',
      fullName: 'Vikramaditya Rao (Chief System Admin)',
      email: 'admin@neobank.com',
      phone: '+91 98000 11000',
      aadhaar: '111122223333',
      pan: 'ADMIN0001Z',
      dob: '1985-04-10',
      gender: 'Male',
      address: { street: '1, NeoBank HQ, Financial District', city: 'Mumbai', state: 'Maharashtra', pincode: '400051', type: 'Permanent' },
      username: 'admin',
      status: 'active',
      kycStatus: 'Verified',
      createdAt: new Date('2025-01-01')
    },
    {
      id: 'usr-user-01',
      role: 'user',
      fullName: 'Venkat Raman',
      email: 'venkat@neobank.com',
      phone: '+91 98111 22333',
      aadhaar: '444455556666',
      pan: 'VENKT1234A',
      dob: '1992-10-18',
      gender: 'Male',
      address: { street: '204, Silicon Heights, HSR Layout', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', type: 'Residential' },
      username: 'venkat',
      status: 'active',
      kycStatus: 'Verified',
      createdAt: new Date('2026-01-15')
    },
    {
      id: 'usr-user-02',
      role: 'user',
      fullName: 'Arjun Mehta',
      email: 'arjun.mehta@email.com',
      phone: '+91 98765 43210',
      aadhaar: '891234567890',
      pan: 'ABCDE1234F',
      dob: '1995-08-15',
      gender: 'Male',
      address: { street: '402, Horizon Towers, MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', type: 'Residential' },
      username: 'arjunmehta',
      status: 'active',
      kycStatus: 'Verified',
      createdAt: new Date('2026-03-10')
    },
    {
      id: 'usr-user-03',
      role: 'user',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@neobank.com',
      phone: '+91 99222 33444',
      aadhaar: '777788889999',
      pan: 'PRIYA9876B',
      dob: '1996-11-20',
      gender: 'Female',
      address: { street: '12, Jubilee Hills, Road No 36', city: 'Hyderabad', state: 'Telangana', pincode: '500033', type: 'Residential' },
      username: 'priyasharma',
      status: 'active',
      kycStatus: 'Verified',
      createdAt: new Date('2026-05-04')
    }
  ]);

  readonly profile = signal<UserProfile>({
    name: this.sessionUserState()?.fullName || 'Venkat Raman',
    email: this.sessionUserState()?.email || 'venkat@neobank.com',
    phone: this.sessionUserState()?.phone || '+91 98111 22333',
    initials: (this.sessionUserState()?.fullName || 'Venkat Raman').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    memberSince: 'January 2026',
    customerId: 'NEO-894210',
    pan: this.sessionUserState()?.pan || 'VENKT1234A',
    aadhaar: this.sessionUserState()?.aadhaar || '4444 5555 6666',
    kycVerified: true,
    dob: this.sessionUserState()?.dob || '1992-10-18',
    username: this.sessionUserState()?.username || 'venkat',
    role: this.sessionUserState()?.role || 'user',
    nominee: {
      name: 'Ananya Raman',
      relationship: 'Spouse',
      dob: '1994-06-12',
      phone: '+91 98111 44555'
    },
    address: {
      street: '204, Silicon Heights, HSR Layout',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560102',
      type: 'Residential'
    }
  });

  private readonly accountsState = signal<Account[]>([
    { id: 'primary', name: 'Neo Primary', type: 'Savings Account', number: '•••• 4821', balance: 128450.75, color: 'blue', status: 'active', holderName: 'Venkat Raman', holderId: 'usr-user-01', accountType: 'Savings', createdAt: new Date('2026-01-15') },
    { id: 'growth', name: 'Growth Vault', type: 'Current Account', number: '•••• 9082', balance: 34520.5, color: 'violet', status: 'active', holderName: 'Venkat Raman', holderId: 'usr-user-01', accountType: 'Current', createdAt: new Date('2026-02-01') },
    { id: 'travel', name: 'Salary Pocket', type: 'Salary Account', number: '•••• 0168', balance: 12460, color: 'orange', status: 'active', holderName: 'Venkat Raman', holderId: 'usr-user-01', accountType: 'Salary', createdAt: new Date('2026-04-10') },
    { id: 'acc-joint-01', name: 'Family Wealth Hub', type: 'Joint Account', number: '•••• 7731', balance: 450000.0, color: 'green', status: 'active', holderName: 'Venkat & Ananya Raman', holderId: 'usr-user-01', accountType: 'Joint', jointHolders: ['Venkat Raman', 'Ananya Raman'], createdAt: new Date('2026-05-15') }
  ]);

  private readonly loansState = signal<LoanApplication[]>(this.checkInitialLoans());

  // Readonly Signals & Getters
  readonly transactions = this.transactionState.asReadonly();
  readonly balance = this.balanceState.asReadonly();
  readonly cardFrozen = this.cardFrozenState.asReadonly();
  readonly alerts = this.alertsState.asReadonly();
  readonly isLoggedIn = this.loggedInState.asReadonly();
  readonly currentUserRole = this.roleState.asReadonly();
  readonly currentToken = this.tokenState.asReadonly();
  readonly currentSessionUser = this.sessionUserState.asReadonly();
  readonly createdAccount = this.createdAccountState.asReadonly();
  readonly usersList = this.usersState.asReadonly();
  readonly accountsList = this.accountsState.asReadonly();
  readonly loansList = this.loansState.asReadonly();

  readonly userLoans = computed(() => {
    const current = this.sessionUserState() || this.profile();
    const name = current ? ('fullName' in current ? current.fullName : current.name) : 'Venkat Raman';
    return this.loansState().filter((l) => l.customerName.toLowerCase() === name.toLowerCase() || l.customerId === 'NEO-894210');
  });

  readonly savings = computed(() => 34520.5);
  readonly income = computed(() => 82500);
  readonly expenses = computed(() =>
    this.transactionState().filter((item) => item.type === 'debit').reduce((sum, item) => sum + item.amount, 0)
  );
  readonly investmentValue = computed(() => 45580.25);

  get accounts(): Account[] {
    return this.accountsState();
  }

  // Initial State Checkers from Storage
  private checkInitialLogin(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem('neobank_jwt_token') !== null && localStorage.getItem('neobank_auth_role') !== null;
  }

  private checkInitialRole(): UserRole | null {
    if (typeof localStorage === 'undefined') return null;
    const stored = localStorage.getItem('neobank_auth_role');
    return stored === 'admin' || stored === 'user' ? stored : null;
  }

  private checkInitialToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem('neobank_jwt_token');
  }

  private checkInitialSessionUser(): UserEntity | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem('neobank_session_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserEntity;
    } catch {
      return null;
    }
  }

  private checkInitialLoans(): LoanApplication[] {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('neobank_loans_list');
      if (raw) {
        try {
          return JSON.parse(raw) as LoanApplication[];
        } catch {
          // fallback to defaults
        }
      }
    }
    return [
      { id: 'LN-89410', customerName: 'Venkat Raman', customerId: 'NEO-894210', type: 'Personal Instant Credit Line', amount: 350000, tenure: '36 Months', emi: 11420, remainingAmount: 216980, interestRate: 10.5, status: 'Active', appliedDate: '2026-01-14', nextDueDate: '05 Aug 2026' },
      { id: 'LN-89302', customerName: 'Ananya Sharma', customerId: 'NEO-784102', type: 'Home Improvement Vault Loan', amount: 1500000, tenure: '120 Months', emi: 19850, remainingAmount: 1420000, interestRate: 8.4, status: 'Active', appliedDate: '2026-03-10', nextDueDate: '05 Aug 2026' },
      { id: 'LN-89215', customerName: 'Vikram Aditya', customerId: 'NEO-651092', type: 'Auto / Electric Vehicle Loan', amount: 800000, tenure: '60 Months', emi: 16800, remainingAmount: 800000, interestRate: 9.2, status: 'Pending', appliedDate: '2026-07-12' },
      { id: 'LN-89104', customerName: 'Sneha Kapoor', customerId: 'NEO-902184', type: 'Education Advance Loan', amount: 650000, tenure: '84 Months', emi: 10400, remainingAmount: 580000, interestRate: 8.8, status: 'Active', appliedDate: '2026-02-08', nextDueDate: '05 Aug 2026' }
    ];
  }

  // ==========================================================
  // AUTHENTICATION & AUTHORIZATION MODULE
  // ==========================================================

  authenticate(role: UserRole, emailOrUsername: string, passwordPlain: string, rememberMe = true): { success: boolean; message: string; response?: JwtAuthResponse } {
    const query = emailOrUsername.trim().toLowerCase();
    const foundUser = this.usersState().find(
      (u) =>
        (u.email.toLowerCase() === query || u.username.toLowerCase() === query) &&
        u.role === role
    );

    // Password validation simulation (password123 for users, admin123 for admin, or any password with >=6 chars if matching registered users)
    if (!foundUser) {
      return { success: false, message: `Invalid credentials for role (${role === 'admin' ? 'Admin' : 'User'}). Please verify your role selection and email.` };
    }

    if (foundUser.status !== 'active') {
      return { success: false, message: `This account has been ${foundUser.status}. Please contact support.` };
    }

    const isValidPassword =
      (foundUser.role === 'admin' && passwordPlain === 'admin123') ||
      (foundUser.role === 'user' && (passwordPlain === 'password123' || passwordPlain.length >= 8 || passwordPlain === 'password'));

    if (!isValidPassword) {
      return { success: false, message: 'Invalid password. Try password123 (for user) or admin123 (for admin).' };
    }

    // Generate simulated JWT token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: foundUser.id, role: foundUser.role, email: foundUser.email, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
    const signature = btoa('simulated_secure_neobank_secret_signature_key');
    const token = `${header}.${payload}.${signature}`;

    const jwtResponse: JwtAuthResponse = {
      token,
      role: foundUser.role,
      user: foundUser,
      expiresIn: 86400
    };

    // Update State
    this.tokenState.set(token);
    this.roleState.set(foundUser.role);
    this.sessionUserState.set(foundUser);
    this.loggedInState.set(true);

    if (foundUser.role === 'user') {
      this.profile.set({
        name: foundUser.fullName,
        email: foundUser.email,
        phone: foundUser.phone,
        initials: foundUser.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
        memberSince: 'January 2026',
        customerId: `NEO-${foundUser.id.replace(/[^0-9]/g, '') || '894210'}`,
        pan: foundUser.pan,
        aadhaar: foundUser.aadhaar,
        kycVerified: foundUser.kycStatus === 'Verified',
        dob: foundUser.dob,
        username: foundUser.username,
        role: foundUser.role,
        address: foundUser.address
      });
    }

    // Persist in Local / Session Storage
    if (typeof localStorage !== 'undefined') {
      if (rememberMe) {
        localStorage.setItem('neobank_jwt_token', token);
        localStorage.setItem('neobank_auth_role', foundUser.role);
        localStorage.setItem('neobank_session_user', JSON.stringify(foundUser));
      } else {
        sessionStorage.setItem('neobank_jwt_token', token);
        sessionStorage.setItem('neobank_auth_role', foundUser.role);
        sessionStorage.setItem('neobank_session_user', JSON.stringify(foundUser));
      }
    }

    this.pushAlert(`Welcome back, ${foundUser.fullName}! Logged in as ${foundUser.role === 'admin' ? 'System Admin' : 'Customer'}.`, 'success');
    return { success: true, message: 'Login successful.', response: jwtResponse };
  }

  registerUser(data: {
    fullName: string;
    email: string;
    phone: string;
    aadhaar: string;
    pan: string;
    dob: string;
    gender: 'Male' | 'Female' | 'Other';
    address: Address;
    username: string;
    passwordPlain: string;
  }): { success: boolean; message: string } {
    const existingEmail = this.usersState().find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existingEmail) {
      return { success: false, message: 'Email address is already registered. Please sign in.' };
    }
    const existingUsername = this.usersState().find((u) => u.username.toLowerCase() === data.username.toLowerCase());
    if (existingUsername) {
      return { success: false, message: 'Username is already taken. Please choose another.' };
    }
    const existingPhone = this.usersState().find((u) => u.phone === data.phone);
    if (existingPhone) {
      return { success: false, message: 'Phone number is already linked to an account.' };
    }
    const existingAadhaar = this.usersState().find((u) => u.aadhaar.replace(/\s+/g, '') === data.aadhaar.replace(/\s+/g, ''));
    if (existingAadhaar) {
      return { success: false, message: 'Aadhaar number already registered with NeoBank.' };
    }

    const newId = `usr-user-${Math.floor(100 + Math.random() * 900)}`;
    const newUser: UserEntity = {
      id: newId,
      role: 'user',
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      aadhaar: data.aadhaar,
      pan: data.pan.toUpperCase(),
      dob: data.dob,
      gender: data.gender,
      address: data.address,
      username: data.username,
      status: 'active',
      kycStatus: 'Verified',
      createdAt: new Date()
    };

    this.usersState.update((list) => [...list, newUser]);

    // Also create a default Savings Account for the new user
    const newAcc: Account = {
      id: `acc-${newId}`,
      name: 'Neo Primary',
      type: 'Savings Account',
      number: `•••• ${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 15000,
      color: 'blue',
      status: 'active',
      holderName: data.fullName,
      holderId: newId,
      accountType: 'Savings',
      createdAt: new Date()
    };
    this.accountsState.update((list) => [...list, newAcc]);

    this.pushAlert('Registration successful! Please sign in with your credentials.', 'success');
    return { success: true, message: 'Registration Successful. Please login to continue.' };
  }

  login(): void {
    // Backward compatibility for simple call without params
    this.authenticate('user', 'venkat@neobank.com', 'password123');
  }

  logout(): void {
    this.loggedInState.set(false);
    this.tokenState.set(null);
    this.roleState.set(null);
    this.sessionUserState.set(null);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('neobank_jwt_token');
      localStorage.removeItem('neobank_auth_role');
      localStorage.removeItem('neobank_session_user');
      sessionStorage.removeItem('neobank_jwt_token');
      sessionStorage.removeItem('neobank_auth_role');
      sessionStorage.removeItem('neobank_session_user');
    }

    this.pushAlert('You have logged out successfully. Session terminated securely.', 'info');
    this.router.navigate(['/login']);
  }

  // ==========================================================
  // ADMIN MANAGEMENT MODULE: USERS
  // ==========================================================

  getUsers(): UserEntity[] {
    return this.usersState();
  }

  addUser(user: Omit<UserEntity, 'id' | 'createdAt'>): UserEntity {
    const id = `usr-${user.role}-${Math.floor(100 + Math.random() * 900)}`;
    const newRecord: UserEntity = { ...user, id, createdAt: new Date() };
    this.usersState.update((list) => [...list, newRecord]);
    this.pushAlert(`New ${user.role} "${user.fullName}" added to portal.`, 'success');
    return newRecord;
  }

  updateUser(id: string, updates: Partial<UserEntity>): void {
    this.usersState.update((list) =>
      list.map((u) => (u.id === id ? { ...u, ...updates } : u))
    );
    this.pushAlert('User record updated successfully.', 'success');
  }

  deleteUser(id: string): void {
    this.usersState.update((list) => list.filter((u) => u.id !== id));
    this.pushAlert('User record deleted from database.', 'info');
  }

  toggleUserStatus(id: string): void {
    this.usersState.update((list) =>
      list.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'inactive' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    this.pushAlert('User account access status updated.', 'info');
  }

  toggleAccountLock(id: string): void {
    this.usersState.update((list) =>
      list.map((u) => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'frozen' : 'active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    this.saveToStorage();
    this.pushAlert('Customer portal access updated.', 'info');
  }

  updateUserKycStatus(id: string, kycStatus: 'Verified' | 'Pending' | 'Rejected'): void {
    this.usersState.update((list) =>
      list.map((u) => (u.id === id ? { ...u, kycStatus } : u))
    );
    this.saveToStorage();
    this.pushAlert(`Customer KYC verification status set to ${kycStatus}.`, kycStatus === 'Verified' ? 'success' : 'info');
  }

  // ==========================================================
  // ADMIN MANAGEMENT MODULE: ACCOUNTS
  // ==========================================================

  getAllAccounts(): Account[] {
    return this.accountsState();
  }

  createBankAccount(acc: Omit<Account, 'id' | 'createdAt'>): Account {
    const id = `acc-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAcc: Account = {
      ...acc,
      id,
      createdAt: new Date(),
      status: acc.status || 'active'
    };
    this.accountsState.update((list) => [...list, newAcc]);
    this.saveToStorage();
    this.pushAlert(`New ${acc.accountType || acc.type} created for ${acc.holderName}.`, 'success');
    return newAcc;
  }

  updateBankAccount(id: string, updates: Partial<Account>): void {
    this.accountsState.update((list) =>
      list.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
    this.saveToStorage();
    this.pushAlert('Bank account details updated.', 'success');
  }

  freezeAccount(id: string): void {
    this.accountsState.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'frozen' } : a))
    );
    this.saveToStorage();
    this.pushAlert('Bank account status changed to FROZEN.', 'danger');
  }

  toggleAccountFreeze(id: string): void {
    this.accountsState.update((list) =>
      list.map((a) => {
        if (a.id === id) {
          const nextStatus = a.status === 'active' ? 'frozen' : 'active';
          return { ...a, status: nextStatus };
        }
        return a;
      })
    );
    this.saveToStorage();
    this.pushAlert('Vault operational status toggled.', 'info');
  }

  closeAccount(id: string): void {
    this.accountsState.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'closed' } : a))
    );
    this.saveToStorage();
    this.pushAlert('Bank account permanently CLOSED.', 'info');
  }

  deleteAccount(id: string): void {
    this.closeAccount(id);
  }

  activateAccount(id: string): void {
    this.accountsState.update((list) =>
      list.map((a) => (a.id === id ? { ...a, status: 'active' } : a))
    );
    this.saveToStorage();
    this.pushAlert('Bank account status activated.', 'success');
  }

  // ==========================================================
  // LOANS & CREDIT MODULE
  // ==========================================================

  applyForLoan(data: Omit<LoanApplication, 'id' | 'appliedDate' | 'status'>): LoanApplication {
    const id = `LN-${Math.floor(10000 + Math.random() * 90000)}`;
    const newLoan: LoanApplication = {
      ...data,
      id,
      status: 'Active',
      appliedDate: new Date().toISOString().split('T')[0],
      remainingAmount: data.amount,
      nextDueDate: '05 Aug 2026'
    };
    this.loansState.update((list) => [newLoan, ...list]);
    this.addMoney(data.amount, `Instant Loan Disbursal (${id})`);
    this.saveToStorage();
    this.pushAlert(`Congratulations! ${data.type} of ${this.inr(data.amount)} has been approved and disbursed to your account.`, 'success');
    return newLoan;
  }

  payLoanEmi(loanId: string): boolean {
    const loan = this.loansState().find((l) => l.id === loanId);
    if (!loan) {
      this.pushAlert('Loan record not found.', 'danger');
      return false;
    }
    if (loan.status !== 'Active') {
      this.pushAlert('This loan is not active or has already been closed.', 'info');
      return false;
    }
    const emiAmount = loan.emi || 10000;
    if (this.balanceState() < emiAmount) {
      this.pushAlert(`Insufficient balance to pay EMI of ${this.inr(emiAmount)}. Please add funds.`, 'danger');
      return false;
    }

    this.balanceState.update((b) => b - emiAmount);
    const updatedRemaining = Math.max(0, (loan.remainingAmount || loan.amount) - emiAmount);
    const updatedStatus = updatedRemaining <= 0 ? 'Closed' : 'Active';

    this.loansState.update((list) =>
      list.map((l) => (l.id === loanId ? { ...l, remainingAmount: updatedRemaining, status: updatedStatus } : l))
    );
    this.addTransaction({
      merchant: `EMI Payment - ${loan.type} (${loan.id})`,
      category: 'Loan EMI',
      amount: emiAmount,
      type: 'debit',
      icon: 'bi-bank2',
      status: 'Completed',
      accountId: 'primary'
    });
    this.saveToStorage();
    this.pushAlert(`EMI payment of ${this.inr(emiAmount)} completed successfully. Remaining balance: ${this.inr(updatedRemaining)}.`, 'success');
    return true;
  }

  updateLoanStatus(id: string, newStatus: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed'): void {
    this.loansState.update((list) =>
      list.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    this.saveToStorage();
    this.pushAlert(`Loan application ${id} status changed to ${newStatus}.`, newStatus === 'Approved' || newStatus === 'Active' ? 'success' : 'info');
  }

  // ==========================================================
  // EXISTING BANKING METHODS (PRESERVED)
  // ==========================================================

  addMoney(amount: number, source = 'Account top up'): void {
    this.balanceState.update((balance) => balance + amount);
    this.addTransaction({ merchant: source, category: 'Deposit', amount, type: 'credit', icon: 'bi-arrow-down-left', status: 'Completed', accountId: 'primary' });
    this.pushAlert(`${this.inr(amount)} added to your Neo Primary account.`, 'success');
  }

  withdrawMoney(amount: number, destination = 'ATM / Bank Withdrawal'): boolean {
    if (amount <= 0 || amount > this.balanceState()) {
      this.pushAlert('Enter an amount within your available balance.', 'danger');
      return false;
    }
    this.balanceState.update((balance) => balance - amount);
    this.addTransaction({ merchant: destination, category: 'Withdrawal', amount, type: 'debit', icon: 'bi-arrow-up-right', status: 'Completed', accountId: 'primary' });
    this.pushAlert(`${this.inr(amount)} withdrawn successfully.`, 'success');
    return true;
  }

  sendMoney(amount: number, recipient: string, category = 'Transfer'): boolean {
    if (amount <= 0 || amount > this.balanceState()) {
      this.pushAlert('Enter an amount within your available balance.', 'danger');
      return false;
    }
    this.balanceState.update((balance) => balance - amount);
    this.addTransaction({ merchant: recipient, category, amount, type: 'debit', icon: 'bi-send', status: 'Completed', accountId: 'primary', senderOrRecipient: recipient });
    this.pushAlert(`${this.inr(amount)} sent to ${recipient}.`, 'success');
    return true;
  }

  submitOnboarding(app: OnboardingApplication): CreatedAccountResult {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const customerId = `NEO-${Math.floor(100000 + Math.random() * 900000)}`;
    const accountNumber = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const ifscCode = 'NEOB0001024';
    const debitCardNumber = `4532 •••• •••• ${randomSuffix}`;
    const initials = app.fullName.split(' ').map((part) => part.charAt(0).toUpperCase()).join('').slice(0, 2) || 'NB';

    const result: CreatedAccountResult = {
      customerId,
      accountNumber,
      ifscCode,
      debitCardNumber,
      accountType: app.accountType,
      fullName: app.fullName
    };

    this.createdAccountState.set(result);
    this.profile.set({
      name: app.fullName,
      email: app.email,
      phone: app.phone,
      initials,
      memberSince: 'July 2026',
      customerId,
      pan: app.pan,
      aadhaar: app.aadhaar,
      kycVerified: true,
      dob: app.dob,
      nominee: app.nominee,
      address: app.address
    });

    const initialBal = app.initialDeposit > 0 ? app.initialDeposit : 10000;
    this.balanceState.set(initialBal);

    this.accountsState.update((list) => [
      {
        id: 'primary',
        name: `Neo ${app.accountType.split(' ')[0]}`,
        type: app.accountType,
        number: `•••• ${randomSuffix}`,
        balance: initialBal,
        color: 'blue',
        status: 'active',
        holderName: app.fullName,
        accountType: app.accountType.includes('Savings') ? 'Savings' : 'Current',
        createdAt: new Date()
      },
      ...list.filter((a) => a.id !== 'primary')
    ]);

    this.addTransaction({
      merchant: app.depositSource || 'Initial Onboarding Deposit',
      category: 'Deposit',
      amount: initialBal,
      type: 'credit',
      icon: 'bi-bank',
      status: 'Completed',
      accountId: 'primary'
    });

    this.pushAlert('Congratulations! Your NeoBank account has been created successfully.', 'success');
    return result;
  }

  toggleCard(): void {
    this.cardFrozenState.update((value) => !value);
    this.pushAlert(this.cardFrozenState() ? 'Your virtual card is now frozen.' : 'Your virtual card is ready to use.', 'info');
  }

  updateProfile(profile: UserProfile): void {
    this.profile.set(profile);
    if (this.sessionUserState()) {
      this.sessionUserState.update((u) => u ? { ...u, fullName: profile.name, email: profile.email, phone: profile.phone } : null);
    }
    this.pushAlert('Your profile has been updated.', 'success');
  }

  dismissAlert(id: number): void {
    this.alertsState.update((items) => items.filter((item) => item.id !== id));
  }

  private addTransaction(data: Omit<Transaction, 'id' | 'date'>): void {
    this.transactionState.update((transactions) => [{ ...data, id: crypto.randomUUID(), date: new Date() }, ...transactions]);
  }

  private pushAlert(text: string, type: AlertMessage['type']): void {
    const id = Date.now();
    this.alertsState.update((items) => [...items, { id, text, type }]);
    setTimeout(() => this.dismissAlert(id), 4500);
  }

  saveToStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('neobank_users_list', JSON.stringify(this.usersState()));
        localStorage.setItem('neobank_accounts_list', JSON.stringify(this.accountsState()));
      } catch {
        // ignore storage quota limits
      }
    }
  }

  inr(amount: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  }
}

