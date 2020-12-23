'use strict';
require('dotenv').config();

const username = process.env.NAME;
const password = process.env.PASSWORD;
const database = process.env.DATABASE;
const host = process.env.HOST;
const node_env = process.env.NODE_ENV;
const dialect = process.env.DIALECT;
const config = {
	dev: {
		db: {
			username,
			password,
			database,
			host,
			dialect
		}
	}
	
}

module.exports = config[node_env];