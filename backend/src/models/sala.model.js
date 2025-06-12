import pool from '../config/db.js';

export const createSala = async (title, xml, description, userId) => {
    const result = await pool.query(
        `INSERT INTO "Salas" (title, xml, description, userId) VALUES ($1, $2, $3, $4) RETURNING *`,
        [title, xml, description, userId]
    );
    return result.rows[0];
};

export const getSalaById = async (id) => {
    const result = await pool.query(
        'SELECT * FROM "Salas" WHERE id = $1 AND eliminar = false',
        [id]
    );
    return result.rows[0];
};

export const getSala = async (userId) => {
    const result = await pool.query('SELECT * FROM "Salas" WHERE userId = $1 and eliminar = false', [userId]);
    return result.rows;
};

export const updateSala = async (id, title, xml, description) => {
    let fields = [];
    let values = [];
    let counter = 1;
    if (title !== undefined && title !== null) {
        fields.push(`title = $${counter++}`);
        values.push(title);
    }
    if (xml !== undefined && xml !== null) {
        fields.push(`xml = $${counter++}`);
        values.push(xml);
    }
    if (description !== undefined && description !== null) {
        fields.push(`description = $${counter++}`);
        values.push(description);
    }
    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }
    values.push(id);
    const query = `UPDATE "Salas" SET ${fields.join(', ')} WHERE id = $${counter} AND eliminar = false RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
};

export const deleteSala = async (id) => {
    const result = await pool.query(
        'UPDATE "Salas" SET eliminar = true WHERE id = $1 RETURNING *',
        [id]
    );
    return result.rows[0];
};
