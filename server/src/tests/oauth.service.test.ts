import { describe, expect, it, vi, beforeEach } from "vitest";

const generateOAuthUrl = vi.fn();
const processOAuthCallback = vi.fn();
const decodeOAuthState = vi.fn();

vi.mock("corsair/oauth", () => ({
  generateOAuthUrl: (...args: unknown[]) => generateOAuthUrl(...args),
  processOAuthCallback: (...args: unknown[]) => processOAuthCallback(...args),
  decodeOAuthState: (...args: unknown[]) => decodeOAuthState(...args),
}));

vi.mock("../corsair.js", () => ({
  corsair: {},
}));

import { OAuthService } from "../services/oauth.service.js";
import { ForbiddenError, ValidationError } from "../errors/app.errors.js";
import type { IntegrationRepository } from "../repositories/integration.repository.js";

const USER_A = "11111111-1111-1111-1111-111111111111";
const USER_B = "22222222-2222-2222-2222-222222222222";

function createMockRepository(overrides: Partial<IntegrationRepository> = {}) {
  return {
    getByProvider: vi.fn(async () => null),
    create: vi.fn(async (input) => ({
      id: "integration-id",
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    })),
    getByUserId: vi.fn(),
    getUserIntegration: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    ...overrides,
  } as unknown as IntegrationRepository;
}

describe("OAuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("generates a connect URL scoped to the user as tenant", async () => {
    generateOAuthUrl.mockResolvedValue({ url: "https://accounts.google.com/o/oauth2/auth", state: "signed-state" });

    const service = new OAuthService(createMockRepository());
    const result = await service.getConnectUrl(USER_A, "gmail");

    expect(result.url).toContain("accounts.google.com");
    expect(generateOAuthUrl).toHaveBeenCalledWith(
      expect.anything(),
      "gmail",
      expect.objectContaining({ tenantId: USER_A })
    );
  });

  it("rejects an invalid OAuth state", async () => {
    decodeOAuthState.mockReturnValue(null);

    const service = new OAuthService(createMockRepository());

    await expect(
      service.handleCallback(USER_A, "code", "bad-state")
    ).rejects.toBeInstanceOf(ValidationError);

    expect(processOAuthCallback).not.toHaveBeenCalled();
  });

  it("rejects a state belonging to another user", async () => {
    decodeOAuthState.mockReturnValue({
      plugin: "gmail",
      tenantId: USER_B,
      iat: 0,
    });

    const service = new OAuthService(createMockRepository());

    await expect(
      service.handleCallback(USER_A, "code", "state-for-b")
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(processOAuthCallback).not.toHaveBeenCalled();
  });

  it("completes the callback and persists the integration", async () => {
    decodeOAuthState.mockReturnValue({
      plugin: "gmail",
      tenantId: USER_A,
      iat: 0,
    });
    processOAuthCallback.mockResolvedValue({ plugin: "gmail", tenantId: USER_A });

    const repository = createMockRepository();
    const service = new OAuthService(repository);

    const result = await service.handleCallback(USER_A, "code", "state-for-a");

    expect(result.provider).toBe("gmail");
    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: USER_A,
        provider: "gmail",
        corsairAccountId: USER_A,
      })
    );
  });

  it("does not duplicate an already-connected integration", async () => {
    decodeOAuthState.mockReturnValue({
      plugin: "googlecalendar",
      tenantId: USER_A,
      iat: 0,
    });
    processOAuthCallback.mockResolvedValue({
      plugin: "googlecalendar",
      tenantId: USER_A,
    });

    const repository = createMockRepository({
      getByProvider: vi.fn(async () => ({
        id: "existing-id",
        userId: USER_A,
        provider: "googlecalendar",
        corsairAccountId: USER_A,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    });

    const service = new OAuthService(repository);

    await service.handleCallback(USER_A, "code", "state-for-a");

    expect(repository.create).not.toHaveBeenCalled();
  });
});
