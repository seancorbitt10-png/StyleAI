import { NotConfiguredError } from '../errors';

export type AuthMethod = 'email' | 'google';

export type AuthSession = {
  userId: string;
  email: string | null;
  accessToken: string;
};

export type EmailAuthInput = {
  email: string;
  password: string;
};

export interface AuthProvider {
  signUpWithEmail(input: EmailAuthInput): Promise<{ session: AuthSession | null; needsEmailVerification: boolean }>;
  signInWithEmail(input: EmailAuthInput): Promise<AuthSession>;
  startGoogleSignIn(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  signOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
}

export interface BillingProvider {
  readonly name: string;
  restorePurchases(userId: string): Promise<void>;
}

export class UnconfiguredBillingProvider implements BillingProvider {
  readonly name = 'unconfigured';
  async restorePurchases(): Promise<void> {
    throw new NotConfiguredError('BillingProvider');
  }
}

export interface VirtualTryOnProvider {
  readonly name: string;
}

export class UnconfiguredVirtualTryOnProvider implements VirtualTryOnProvider {
  readonly name = 'unconfigured';
}
