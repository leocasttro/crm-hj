export interface PacienteDto {
  // Identificação
  id: string;

  // Nome
  primeiroNome: string;
  sobrenome: string;
  nomeCompleto: string;

  // Documento
  documentoTipo: string;      // 'RG', 'CPF', etc
  documentoNumero: string;

  // Contato
  email: string;
  telefones?: string;          // String com JSON ou múltiplos telefones

  // Dados Pessoais
  dataNascimento: string;      // LocalDate → ISO string (YYYY-MM-DD)
  idade?: number;
  sexoCodigo?: string;         // 'M', 'F', etc
  sexoDescricao?: string;

  // Endereço
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  pais?: string;               // Default "Brasil"

  // Campos calculados
  maiorDeIdade?: boolean;
  idoso?: boolean;
  possuiWhatsApp?: boolean;

  // Status
  ativo: boolean;

  // Datas de controle
  criadoEm: string;            // LocalDate → ISO string
  atualizadoEm?: string;        // LocalDate → ISO string
}
