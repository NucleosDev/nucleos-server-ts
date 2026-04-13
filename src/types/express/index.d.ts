import { UserPayload } from "../../types/auth";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    requestId?: string;
  }
}

export {};

export {};

declare global {
  var __serverStarted: boolean | undefined;
}

export {};

declare global {
  var __serverStarted: boolean | undefined;
}
