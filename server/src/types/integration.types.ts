export const INTEGRATION_PROVIDERS = ["gmail", "googlecalendar"] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export interface Integration {
  id: string;
  userId: string;
  provider: IntegrationProvider;
  corsairAccountId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIntegrationInput {
  userId: string;
  provider: IntegrationProvider;
  corsairAccountId: string;
}

export interface UpdateIntegrationInput {
  corsairAccountId?: string;
}
