const Datastore = require("nedb");
const db = new Datastore({ filename: '.data/new_datafile', autoload: true });

function getDb() {
  return db;
}

function promisify(invokee) {
  return new Promise((resolve, reject) => {
    invokee((err, result) => {
      console.log("invokee cb", err, result);
      if (err) { return reject(err); }
      resolve(result);
    });
  });
}

function storeState(channelId, state) {
  const _id = `state:${channelId}`;
  const db = getDb();
  const stateToUpsert = Object.assign({}, state, {_id});
  return promisify((cb) => db.update({_id}, stateToUpsert, {upsert: true}, cb));
}

function getState(channelId) {
  console.log("Does this work? Getting state");
  const _id = `state:${channelId}`;
  const db = getDb();
  return promisify((cb) => db.findOne({_id}, cb));
}

module.exports = {
  getState,
  storeState
};