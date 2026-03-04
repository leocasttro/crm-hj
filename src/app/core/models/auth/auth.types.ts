export interface LoginRequest {
  email: string;
  senha: string;
}

export interface TokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface UsuarioLogado {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}
