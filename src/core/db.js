import DataStore from "nedb";

const db = {};

db.leaderboards = new DataStore("db/leaderboards.db");

export default db;
