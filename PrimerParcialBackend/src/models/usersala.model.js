import pool from '../config/db.js';

export const createUserSala = async (userId, salas_id) => {
    const existingEntry = await pool.query(
        `SELECT * FROM "Usersala" WHERE userId = $1`,
        [userId]
    );
    if (existingEntry.rows.length > 0) {
        throw new Error('El usuario ya está asociado a esta sala.');
    }
    const result = await pool.query(
        `INSERT INTO "Usersala" (userId, salas_id) VALUES ($1, $2) RETURNING *`,
        [userId, salas_id]
    );
    return result.rows[0];
};

export const getUserSalaById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM "Usersala" WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const getUserSalas = async (userId) => {
    const result = await pool.query(
        `SELECT s.*
         FROM "Usersala" us
         JOIN "Salas" s ON us.salas_id = s.id
         WHERE us.userId = $1 AND s.eliminar = false`,
        [userId]
    );
    return result.rows;
};

export const deleteUserSala = async (id) => {
    const result = await pool.query(
        'DELETE FROM "Usersala" WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};
