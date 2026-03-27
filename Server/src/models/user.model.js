import { db } from "../config/database.js";


// create new user
export const createUser = async (name, email, password, phone, role = "passenger") => {
    const query = `
    INSERT INTO users (name, email, password, phone, role)
    VALUES (?, ?, ?, ?, ?)
  `;

    const [result] = await db.query(query, [
        name, email, password, phone, role
    ]);

    return result;
};

// find user by email 
export const findUserByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE email = ?
  `;

  const [rows] = await db.query(query, [email]);

  return rows[0];
};

// find user by id
export const findUserById = async (id) => {
  const query = `
    SELECT id, name, email, phone, role
    FROM users
    WHERE id = ?
  `;

  const [rows] = await db.query(query, [id]);

  return rows[0];
};

// find user by id with cancellation count
export const findUserByIdWithCancellationCount = async (id) => {
  const query = `
    SELECT id, name, email, phone, role, cancellation_count
    FROM users
    WHERE id = ?
  `;

  const [rows] = await db.query(query, [id]);

  return rows[0];
};

// increment cancellation count for user
export const incrementCancellationCount = async (userId) => {
  const query = `
    UPDATE users
    SET cancellation_count = cancellation_count + 1
    WHERE id = ?
  `;

  const [result] = await db.query(query, [userId]);

  return result;
};

// reset cancellation count for user
export const resetCancellationCount = async (userId) => {
  const query = `
    UPDATE users
    SET cancellation_count = 0
    WHERE id = ?
  `;

  const [result] = await db.query(query, [userId]);

  return result;
};

// get current cancellation count for user
export const getCancellationCount = async (userId) => {
  const query = `
    SELECT cancellation_count
    FROM users
    WHERE id = ?
  `;

  const [rows] = await db.query(query, [userId]);

  return rows[0]?.cancellation_count || 0;
};
