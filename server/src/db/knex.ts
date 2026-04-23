import knex from 'knex';
import config from '../../knexfile';

const env = process.env.NODE_ENV || 'development';
const cfg = config[env] || config.development;

export const db = knex(cfg);