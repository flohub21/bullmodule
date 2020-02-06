'use strict';
var dbm;
var type;
var seed;
const fs = require('fs');
const csvjson = require('csvjson');
const moment =require ('moment');

console.log('import bank account');

function importCsv(fileName) {
  console.log('import csv ');
  return new Promise((resolve) => {
    fs.readFile('/home/PROJECTS/backoffice-backend/migrations/2020-01-10_import_bank/' + fileName + '.csv', 'utf-8', (err, fileContent) => {
      if (err) {
        console.log('erreur');
        console.error(err);
        return;
      }
      const dataCsv = csvjson.toObject(fileContent);

      let listHeader;
      let listData = [];
      dataCsv.forEach((row, index) => {

        for (let key in row) {
          if (index === 0) {
            listHeader = key.split(';');
          }
          listData.push(row[key].split(';'));
        }
      });
      let bankAccount = [];
      listData.forEach((data, index) => {
        bankAccount[index] = {};
        for (let i in data) {
          if (listHeader[i] === 'sign_date') {

            data[i] = moment(data[i], 'DD/MM/YYYY').format('YYYY-MM-DD');
          }
          bankAccount[index][listHeader[i]] = data[i];
        }
      });
      resolve(bankAccount);
    });
  });
}


/**
 *
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = async function(db,callback) {
  var accountRefund = await importCsv('refund_NE_PAS_REMBOURSER');
  let nbUpdate = 0;
  let q= '';
  for(let i = 0; i < accountRefund.length; i++){

      if(accountRefund[i].IBAN === 'NE PAS REMBOURSER' && accountRefund[i].customer_id.indexOf('/') === -1 ){
        let listContract = await getContractId(accountRefund[i].customer_id);
        listContract.forEach((contract)=>{
          q += "update business.cm_contract " +
              " set need_refund = false"+
              " where id = "+contract.id+";";
        });
       // await update(q);
      }

  }
  console.log(q);
  db.runSql(q,null,callback);
  callback();
  return false;


  function update(q) {
    return new Promise((resolve) => {
      db.runSql(q, null, (err, result) => {
        if(err){
          query[5].test = '0';
        }
        resolve();
      });
    });
  }

  function getContractId(customerId) {
    return new Promise((resolve) => {
      let req = "SELECT id from business.cm_contract where customer_id = '" + customerId + "'";
      // console.log(req);
      db.runSql(req, null, (err, result) => {
        resolve(result.rows);
      });
    });
  }
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};


/*select cont.pod, invoice_date, invoice_ref,cont.contract_client_name as nom_contat,cont.customer_id as id_client,  balance_in_progress as montant_ouvert,
left_to_pay as montant_total,invoice_type, invoice_sub_type as sous_type,
acc.owner_name as client_mandat, acc.nr_mandat as mandat, acc.bic, acc.iban, acc.date_signature
from master.invoices inv
LEFT JOIN business.cm_contract cont on inv.pod =  cont.pod
LEFT JOIN business.bank_contract bank on bank.contract_id = cont.id
LEFT JOIN business.account_bank acc on acc.id = bank.account_id
where invoice_date_formatted:: date >= '2019-09-01' and invoice_date_formatted:: date <= '2019-09-30' and bank.type_mandat = 'DOM'
order by mandat desc*/
