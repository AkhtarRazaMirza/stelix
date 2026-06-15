const API_URL = "http://localhost:8000";

export async function register(
  data: {
    fullName: string;
    email: string;
    password: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    throw new Error(
      error.error ||
        "Registration failed"
    );
  }

  return response.json();
}

export async function login(
  data: {
    email: string;
    password: string;
  }
) {
  const response = await fetch(
    `${API_URL}/api/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error =
      await response.json();

    throw new Error(
      error.error || "Login failed"
    );
  }

  return response.json();
}

export async function getCurrentUser() {
  const response = await fetch(
    `${API_URL}/api/auth/me`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export async function logout() {
  const response = await fetch(
    `${API_URL}/api/auth/logout`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Logout failed");
  }

  return response.json();
}