import type { PrismaClient } from "@prisma/client";
import session from "express-session";
import { SESSION_TTL_MS } from "./auth-constants";

function getExpiryFromSession(sess: session.SessionData): Date {
    const expires = sess.cookie?.expires;

    if (!expires) {
        return new Date(Date.now() + SESSION_TTL_MS);
    }

    const asDate = expires instanceof Date ? expires : new Date(expires);

    return Number.isNaN(asDate.getTime()) ? new Date(Date.now() + SESSION_TTL_MS) : asDate;
}

export class PrismaSessionStore extends session.Store {
    constructor(private readonly prisma: PrismaClient) {
        super();
    }

    override async get(
        sid: string,
        callback: (err: unknown, session?: session.SessionData | null) => void,
    ): Promise<void> {
        try {
            const stored = await this.prisma.session.findUnique({ where: { sid } });

            if (!stored) {
                callback(null, null);
                return;
            }

            if (stored.expiresAt.getTime() <= Date.now()) {
                await this.prisma.session.delete({ where: { sid } }).catch(() => undefined);
                callback(null, null);
                return;
            }

            const parsed = JSON.parse(stored.data) as session.SessionData;
            callback(null, parsed);
        } catch (error) {
            callback(error, null);
        }
    }

    override async set(
        sid: string,
        sess: session.SessionData,
        callback?: (err?: unknown) => void,
    ): Promise<void> {
        try {
            if (!sess.userId) {
                callback?.(new Error("Cannot persist a session without userId."));
                return;
            }

            await this.prisma.session.upsert({
                where: { sid },
                create: {
                    sid,
                    userId: sess.userId,
                    data: JSON.stringify(sess),
                    expiresAt: getExpiryFromSession(sess),
                },
                update: {
                    userId: sess.userId,
                    data: JSON.stringify(sess),
                    expiresAt: getExpiryFromSession(sess),
                },
            });

            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    override async destroy(sid: string, callback?: (err?: unknown) => void): Promise<void> {
        try {
            await this.prisma.session.deleteMany({ where: { sid } });
            callback?.();
        } catch (error) {
            callback?.(error);
        }
    }

    override async touch(
        sid: string,
        sess: session.SessionData,
        callback?: () => void,
    ): Promise<void> {
        try {
            await this.prisma.session.updateMany({
                where: { sid },
                data: {
                    expiresAt: getExpiryFromSession(sess),
                    data: JSON.stringify(sess),
                },
            });
            callback?.();
        } catch {
            callback?.();
        }
    }
}
