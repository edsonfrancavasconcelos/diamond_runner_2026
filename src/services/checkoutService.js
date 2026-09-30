const API_URL = "https://diamond-runner-backend.onrender.com";

export const createCheckoutSession = async (
  planName,
  email,
  extraData = {},
) => {
  try {
    const response = await fetch(`${API_URL}/api/payments/checkout`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        planName,
        email,
        ...extraData,
      }),
    });

    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = {
        message: text,
      };
    }

    if (!response.ok) {
      throw new Error(
        data.message || data.error || `Erro HTTP ${response.status}`,
      );
    }

    if (!data.url) {
      throw new Error("Stripe não retornou URL de checkout");
    }

    return {
      url: data.url,
      sessionId: data.sessionId || null,
    };
  } catch (error) {
    console.error("❌ Erro createCheckoutSession:", error);

    throw error;
  }
};
