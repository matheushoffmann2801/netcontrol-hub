export interface License {
  id: string;
  companyId: string;
  token: string;
  expiresAt: string;
  modules: string[];
}

export interface Company {
  id: string;
  name: string;
  document: string;
  status: string;
  lastSeenAt: string | null;
  license: License | null;
}
