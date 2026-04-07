export type PublicUser = {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: Date | string;
};

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
    return /^\S+@\S+\.\S+$/.test(email);
}

export function toPublicUser(user: PublicUser) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
    };
}
