export interface AuthUser {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    authProvider: string;
    providerUserId: string;
    profileData?: any;
}

export interface AuthProvider {
    name: string;
    setupStrategy(): void;
    getAuthRoutes(): any[];
} 