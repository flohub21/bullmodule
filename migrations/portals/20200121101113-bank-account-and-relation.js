'use strict';

var dbm;
var type;
var seed;

/*
create table bank account and bank contract

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
  const req = 'CREATE TABLE business.account_bank ' +
      '(' +
      'id SERIAL PRIMARY KEY NOT NULL,' +
      'date_signature DATE,' +
      'nr_mandat character varying,' +
      'iban character varying (40),'+
      'bic character varying (15),' +
      'owner_name character varying)';
  console.log(req);
      db.runSql(req,null,createBankContract);
  // 'FOREIGN KEY (display_event_id) REFERENCES portals.display_event(id) )';

  function createBankContract(err){
    console.log(err);
    const req = 'CREATE TABLE business.bank_contract' +
        '(' +
        'id SERIAL PRIMARY KEY NOT NULL,' +
        'account_id int,'+
        'contract_id int,'+
        'type_mandat character varying (30),' +
        'comment character varying,' +
        'begin_date DATE,' +
        'end_date DATE,'+
        'FOREIGN KEY (account_id) REFERENCES business.account_bank(id), ' +
        'FOREIGN KEY (contract_id) REFERENCES business.cm_contract(id) ' +
        ')';
    db.runSql(req,null,callback);
  }
};

exports.down = function(db,callback) {
  callback();
  return null;
};

exports._meta = {
  "version": 1
};
