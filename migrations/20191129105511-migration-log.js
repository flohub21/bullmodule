'use strict';

var dbm;
var type;
var seed;

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
    const req = 'CREATE TABLE portals.newbo_logs ' +
    '('+
    'id SERIAL PRIMARY KEY NOT NULL ,'+
    'userMail character varying,'+
    'time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,'+
    'query character varying,'+
    'created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,'+
    'updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP' +
    db.runSql(req,null,callback)
};

exports.down = function(db,callback) {
  callback();
  return null;
};

exports._meta = {
  "version": 1
};
