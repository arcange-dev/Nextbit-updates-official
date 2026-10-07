export type NextBitServiceConfig={supabaseUrl?:string;aiEndpoint?:string;newsEndpoint?:string;newsletterEndpoint?:string;analyticsEndpoint?:string;apiUrl?:string};
export const nextBitServices={api:"/api",auth:"JWT + bcrypt",database:"PostgreSQL",storage:"Application/S3-compatible storage ready to add",ai:"LLM API / NextBit AI",news:"RSS and permitted publisher APIs",email:"Resend or equivalent",analytics:"PostgreSQL events + Vercel Analytics/PostHog"} as const;
export const editorialStates=["draft","review","fact_check","verified","published","archived"] as const;
