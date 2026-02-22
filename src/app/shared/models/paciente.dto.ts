export interface PacienteDto {
  id: string;
  primeiroNome: string;
  sobrenome: string;
  nomeCompleto: string;
  documentoNumero: string;
  email: string;
  dataNascimento: string;
  sexoDescricao?: string;
  telefones?: string; // ou array, depende do backend
}
