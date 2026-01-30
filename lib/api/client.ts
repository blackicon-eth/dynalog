import ky from "ky";

export const api = ky.create({
  prefixUrl: "/api",
  timeout: 30000,
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response) {
          try {
            const body = (await response.json()) as { error?: string };
            error.message = body.error || error.message;
          } catch {
            // Response is not JSON
          }
        }
        return error;
      },
    ],
  },
});
