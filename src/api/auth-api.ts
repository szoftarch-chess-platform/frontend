import type {
  CurrentUser,
  LoginRequest,
  RegisterRequest,
} from './types/platform';

/** Registration, sign-in and sign-out at the platform-service. */
export type AuthApi = {
  register(request: RegisterRequest): Promise<CurrentUser>;
  login(request: LoginRequest): Promise<CurrentUser>;
  logout(): Promise<void>;
  currentUser(): Promise<CurrentUser | null>;
};
