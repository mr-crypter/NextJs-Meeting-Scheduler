// Types only module augmentation; no direct imports needed

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "seller" | "buyer" | null;
      sellerId?: string | null;
    };
  }

  interface User {
    role?: "seller" | "buyer" | null;
    sellerId?: string | null;
  }
}

export {};


