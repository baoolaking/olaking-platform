// Test file for forgot password functionality
// This can be used to manually test the forgot password flow

export async function testForgotPassword(identifier: string) {
  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier }),
    });

    const result = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response body:", result);
    
    return { success: response.ok, data: result };
  } catch (error) {
    console.error("Test error:", error);
    return { success: false, error };
  }
}

// Example usage:
// testForgotPassword("testuser@example.com");
// testForgotPassword("testusername");
// testForgotPassword("+1234567890");