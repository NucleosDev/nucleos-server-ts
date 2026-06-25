declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      requestId?: string;
      timedout?: boolean;
    }
  }

  var __serverStarted: boolean | undefined;
}

export {};
