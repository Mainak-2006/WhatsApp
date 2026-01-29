// Extend Express Request type to include user property from auth middleware
declare namespace Express {
    interface User {
        id: string;
        email?: string;
        username?: string;
        // Add other user properties as needed
    }

    interface Request {
        user?: User;
    }
}
