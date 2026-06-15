export class IntegrationService {
  public async getIntegrations(userId: string) {
    return [
      {
        id: "1",
        provider: "gmail",
        connected: false,
      },
      {
        id: "2",
        provider: "calendar",
        connected: false,
      },
    ];
  }

  public async connectIntegration(
    userId: string,
    provider: string
  ) {
    return {
      success: true,
      provider,
    };
  }

  public async disconnectIntegration(
    integrationId: string
  ) {
    return {
      success: true,
    };
  }
}