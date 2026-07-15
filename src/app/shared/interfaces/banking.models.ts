export type TransactionType = 'credit' | 'debit';
export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'inactive' | 'frozen';
export type AccountStatus = 'active' | 'frozen' | 'closed';

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  date: Date;
  amount: number;
  type: TransactionType;
  icon: string;
  status: 'Completed' | 'Pending';
  accountId?: string;
  senderOrRecipient?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  number: string;
  balance: number;
  color: string;
  status?: AccountStatus;
  holderName?: string;
  holderId?: string;
  accountType?: 'Savings' | 'Current' | 'Salary' | 'Joint';
  jointHolders?: string[];
  createdAt?: Date;
}

export interface Nominee {
  name: string;
  relationship: string;
  dob?: string;
  phone?: string;
  address?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  type?: 'Residential' | 'Permanent';
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  initials: string;
  memberSince: string;
  customerId?: string;
  pan?: string;
  aadhaar?: string;
  kycVerified?: boolean;
  dob?: string;
  gender?: string;
  username?: string;
  role?: UserRole;
  nominee?: Nominee;
  address?: Address;
}

export interface UserEntity {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  phone: string;
  aadhaar: string;
  pan: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address: Address;
  username: string;
  status: UserStatus;
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  createdAt: Date;
}

export interface JwtAuthResponse {
  token: string;
  role: UserRole;
  user: UserEntity;
  expiresIn: number;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalAccounts: number;
  todayTransactionsCount: number;
  pendingKycCount: number;
  recentRegistrations: UserEntity[];
  recentTransactions: Transaction[];
}

export interface OnboardingApplication {
  accountType: 'Savings Account' | 'Current Account' | 'Salary Account';
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  pan: string;
  aadhaar: string;
  address: Address;
  branch: string;
  nominee: Nominee;
  initialDeposit: number;
  depositSource: string;
}

export interface CreatedAccountResult {
  customerId: string;
  accountNumber: string;
  ifscCode: string;
  debitCardNumber: string;
  accountType: string;
  fullName: string;
}

export interface AlertMessage {
  id: number;
  text: string;
  type: 'success' | 'danger' | 'info';
}

export type NotificationCategory = 'payment' | 'security' | 'promo' | 'system';

export interface Notification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  icon: string;
  timestamp: Date;
  read: boolean;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface LoanApplication {
  id: string;
  customerName: string;
  customerId: string;
  type: string;
  amount: number;
  tenure: string;
  emi: number;
  remainingAmount?: number;
  interestRate?: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Active' | 'Closed';
  appliedDate: string;
  nextDueDate?: string;
}

