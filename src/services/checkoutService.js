
const API_URL =
  "https://diamond-runner-backend.onrender.com";


export const createCheckoutSession = async (
  planName,
  email,
  extraData = {}
) => {

  try {

    const response = await fetch(
      `${API_URL}/api/payments/checkout`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          planName,
          email,

          ...extraData,
        }),
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message ||
        data.error ||
        "Erro ao criar checkout Stripe"
      );

    }


    return {
      url: data.url,
      sessionId: data.sessionId,
    };


  } catch (error) {

    console.error(
      "Erro createCheckoutSession:",
      error
    );

    throw error;

  }

};