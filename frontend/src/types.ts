export interface License {
  id: number;
  token: string;
  expiresAt: string;
  modules: string[]; // O backend já faz o parse do JSON para array de strings
}

export interface Customization {
  id: number;
  systemName: string;
  primaryColor: string;
  logoUrl: string | null;
}

export interface Company {
  id: string;
  name: string;
  document: string;
  status: string;
  lastSeenAt: string | null; // Vem como string ISO do JSON
  license?: License;
  customization?: Customization;
}
