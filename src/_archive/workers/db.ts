import { openDB } from 'idb'

const VERSION = 1
const NAME = 'rnm-db'

const db = openDB(NAME, VERSION, {
  upgrade(db) {
    db.createObjectStore('characters')
  },
})

export async function set(key, val) {
  return (await db).put('characters', val, key)
}
