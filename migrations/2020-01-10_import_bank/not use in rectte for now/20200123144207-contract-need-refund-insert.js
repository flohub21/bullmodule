'use strict';

var dbm;
var type;
var seed;
/*
create the table newbo_logs to save all log
 */
/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  const req = 'ALTER TABLE business.cm_contract' +
      ' ADD need_refund boolean default true';
  console.log(req);
      db.runSql(req,null,callback)
};

exports.down = function(db,callback) {
  callback();
  return null;
};

exports._meta = {
  "version": 1
};
