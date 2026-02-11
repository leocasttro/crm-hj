export interface Paciente {
  id?: number;

  nomeCompleto: string;
  dataNascimento: string;
  cpf: string;
  sexo: 'M' | 'F' | 'O';

  endereco: string;
  telefone1: string;
  telefone2?: string;
  email: string;

  convenio?: string;
  numeroCarteirinha?: string;
  validadeCarteirinha?: string;

  observacoes?: string;
}
