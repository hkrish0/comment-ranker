import dotenv from 'dotenv';
import { Client, auth } from 'cassandra-driver';

dotenv.config();

const contactPoints = (process.env.SCYLLA_CONTACT_POINTS || '127.0.0.1').split(',');
const localDataCenter = process.env.SCYLLA_LOCAL_DATACENTER || 'datacenter1';
const keyspace = process.env.SCYLLA_KEYSPACE || 'comments_keyspace';

// Optional authentication
const username = process.env.DB_USER;
const password = process.env.DB_PASS;
const authProvider = username && password ? new auth.PlainTextAuthProvider(username, password) : undefined;

// Optional TLS – set SCYLLA_SSL=true to enable insecure TLS (skip validation) or point NODE_EXTRA_CA_CERTS to cert bundle
const sslEnabled = process.env.SCYLLA_SSL === 'true';
const port = parseInt(process.env.SCYLLA_PORT || '9142', 10);

export const cassandraClient = new Client({
  contactPoints,
  localDataCenter,
  keyspace,
  authProvider,
  protocolOptions: { port },
  ...(sslEnabled ? { sslOptions: { rejectUnauthorized: false } } : {}),
});

export async function initDB() {
  await cassandraClient.connect();
}
