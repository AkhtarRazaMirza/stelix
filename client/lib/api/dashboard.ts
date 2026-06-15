export async function getDashboard() {
  const response = await fetch(
    "http://localhost:8000/api/dashboard",
    {
      credentials: "include",
    }
  );
  
  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}