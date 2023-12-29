const { db } = require('./connection');

function sqlExec(sql) {
  const promise = new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(result);
    });
  });
  return promise;
}

module.exports = {
  sqlExec
};
