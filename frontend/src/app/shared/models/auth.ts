export interface LoginRequest {
  email: string;
  senha: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string; // "Bearer"
}
