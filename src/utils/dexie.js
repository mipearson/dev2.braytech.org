import Dexie from 'dexie';

const db = new Dexie('braytech');
db.version(1).stores({
  manifest: 'version,value'
});

db.version(2).stores({
  manifest: 'version'
});

export default db;
