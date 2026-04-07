import "dotenv/config";
import mysql from "mysql2/promise";

const adminUrl = process.env.ADMIN_DATABASE_URL;

if (!adminUrl) {
    throw new Error("Missing ADMIN_DATABASE_URL in server/.env");
}

const databaseName = "helpdesk";

const connection = await mysql.createConnection(adminUrl);

try {
    await connection.query(`DROP DATABASE IF EXISTS \`${databaseName}\``);
    await connection.query(`CREATE DATABASE \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`Database '${databaseName}' has been recreated.`);
} finally {
    await connection.end();
}
