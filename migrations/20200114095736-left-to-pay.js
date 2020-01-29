'use strict';

var dbm;
var type;
var seed;

/*
 update balance ijn progress for all invoices

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

exports.up = async function(db,callback) {
  let req = " update master.invoices "+
             " set balance_in_progress  = " +
              "    CASE  " +
              "       WHEN (SELECT new_balance FROM master.payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1 ) != '' THEN (SELECT new_balance FROM master.payments_list p WHERE p.invoice_ref = invoices.invoice_ref ORDER BY  p.created_at desc LIMIT 1 )" +
              "       ELSE '0'" +
              "    END"+
             " where payed = '0'";
  console.log(req);
db.runSql(req,null,updateBalance);

function updateBalance(err) {
    if (err) { callback(err); return; }
    req = " update master.invoices "+
        " set balance_in_progress  = " +
        "    CASE  " +
        "       WHEN payed = true  OR balance_in_progress = '' THEN '0' " +
        "       WHEN (balance_in_progress = '' OR balance_in_progress = '0') AND payed = false THEN left_to_pay" +
        "       ELSE balance_in_progress" +
        "    END";
    console.log(req);
    db.runSql(req,null,callback);
}

};

exports.down = function(db,callback) {
  return null;
};

exports._meta = {
  "version": 1
};
