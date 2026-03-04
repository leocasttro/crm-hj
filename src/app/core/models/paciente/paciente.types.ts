// Enums baseados no backend
export type SexoCodigo = 'M' | 'F' | 'O';
export type DocumentoTipo = 'RG' | 'CPF' | 'CNH' | 'PASSAPORTE' | 'OUTRO';

// Para formulários (mais amigável que o DTO)
export interface PacienteForm {
  id?: string;

  // Dados pessoais
  primeiroNome: string;
  sobrenome: string;
  dataNascimento: string;
  sexoCodigo: SexoCodigo;

  // Documento
  documentoTipo: DocumentoTipo;
  documentoNumero: string;

  // Contato
  email: string;
  telefonePrincipal: string;
  telefoneSecundario?: string;
  possuiWhatsApp: boolean;

  // Endereço
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  pais?: string;

  // Observações
  observacoes?: string;
}

// Para listas/resumo
export interface PacienteResumo {
  id: string;
  nomeCompleto: string;
  documentoNumero: string;
  dataNascimento: string;
  idade?: number;
  cidade?: string;
  telefonePrincipal?: string;
}
