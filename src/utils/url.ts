export const getBaseUrl = () => {
  const environment = process.env.NODE_ENV;

  const baseUrl =
    environment === "development"
      ? "https://localhost:3000"
      : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;

  return baseUrl;
};
