export type AuthFeaturesResponse = {
  googleOAuth?: boolean;
  emailVerificationRequired?: boolean;
  turnstile?: {
    enabled: boolean;
    siteKey: string | null;
  };
};
