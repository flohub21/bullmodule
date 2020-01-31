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
  let query = '';
  var accountDom = await importCsv('dom-1');
  var accountRefund = await importCsv('refund_bon');
  let nbInsert = 0;
  for(let iDom = 0;  iDom < accountDom.length; iDom++) {
    // for the refund
    let origin = '';
    let comment = '';
    let idDomBank = await getBankId(accountDom[iDom].IBAN, accountDom[iDom].customer_id,false);

    let iRefund = 0;
    // check if there is a refund account for the current customer
    while (iRefund < accountRefund.length && accountDom[iDom].customer_id !== accountRefund[iRefund].customer_id) {
      iRefund++;
    }
    let idRefundBank;

    // a refund account exist
    if (iRefund <  accountRefund.length) {

        accountRefund[iRefund].saved = true;
        if(accountDom[iDom].IBAN === accountRefund[iRefund].IBAN){
          idRefundBank = idDomBank;
        } else {
          idRefundBank = await getBankId(accountRefund[iRefund].IBAN, accountRefund[iRefund].customer_id,false);
        }
        origin = accountRefund[iRefund].origin;
        comment = accountRefund[iRefund].comment;

      if(accountDom[iDom].customer_id === '100100968') {
        console.log('refund found or the dom------------------------------');
        console.log(accountRefund[iRefund]);
        console.log('iban dom : ' + accountDom[iDom].IBAN);
        console.log('customer id dom : ' + accountDom[iDom].customer_id);
        console.log('id dom : ' + idDomBank[0].id);
        console.log('id refund: ' + idRefundBank[0].id);
      }
    } else {
        // not refund account exist, use the dom account for the refund
        idRefundBank = idDomBank;
    }

    // insert a record in bank contract for each user contract
    let listContractId = await getContractId(accountDom[iDom].customer_id);
    listContractId.forEach((contract)=>{
      query += " INSERT INTO business.bank_contract ("+
          "account_id, contract_id, type_account, origin,comment)"+
          " VALUES ("+idDomBank[0].id+","+contract.id+",'DOM', '', '') ;";
      nbInsert++;

      if(accountDom[iDom].customer_id === '100100968' || true ) {
        console.log('insert dom ');
        console.log(" INSERT INTO business.bank_contract (" +
            "account_id, contract_id, type_account, origin,comment)" +
            " VALUES (" + idDomBank[0].id + "," + contract.id + ",'DOM', '', '') ;");

      }

      // if 'NE PAS REMBOURSER' don't insert a new record
      if(idRefundBank !== null) {

        query += " INSERT INTO business.bank_contract (" +
            "account_id, contract_id, type_account, origin, comment)" +
            " VALUES (" + idRefundBank[0].id + "," + contract.id + ",'REFUND', '" + origin + "', '" + parseString(comment) + "') ;";
            nbInsert++;

        if(accountDom[iDom].customer_id === '100100968' || true) {
          console.log('insert refund  ');
          console.log(" INSERT INTO business.bank_contract (" +
              "account_id, contract_id, type_account, origin, comment)" +
              " VALUES (" + idRefundBank[0].id + "," + contract.id + ",'REFUND', '" + origin + "', '" + parseString(comment) + "') ;");
        }
      }
    });
  }
  console.log('save all refund');
  for(let iRefund = 0;  iRefund < accountRefund.length; iRefund++){
    // don't save refund
    if(accountRefund[iRefund].saved !== true && accountRefund[iRefund].customer_id.indexOf('/') === -1){
      let idRefundBank;
      if(accountRefund[iRefund].IBAN !== 'NE PAS REMBOURSER') {
        idRefundBank = await getBankId(accountRefund[iRefund].IBAN,null,false);
        let listContractId = await getContractId(accountRefund[iRefund].customer_id);
        listContractId.forEach((contract)=>{
          query += " INSERT INTO business.bank_contract ("+
              "account_id, contract_id, type_account, origin, comment)"+
              " VALUES ("+idRefundBank[0].id+","+contract.id+",'REFUND', '"+accountRefund[iRefund].origin+"', '"+parseString(accountRefund[iRefund].comment)+"') ;";
          nbInsert++;
          console.log('')
          if(accountRefund[iRefund].customer_id === '100100968' || true){
            console.log('----------');
            console.log(" INSERT INTO business.bank_contract ("+
                "account_id, contract_id, type_account, origin, comment)"+
                " VALUES ("+idRefundBank[0].id+","+contract.id+",'REFUND', '"+accountRefund[iRefund].origin+"', '"+parseString(accountRefund[iRefund].comment)+"') ;");
            console.log('idRefundBank : ' + idRefundBank[0].id);
            console.log(accountRefund[iRefund]);
          }
        });
      }
    }
  }

  console.log(nbInsert);
  console.log('-------------------------------------------------');

db.runSql(query,null,callback);

  //callback();
  return false;

  function getBankId(iban, customerId = null, test = false) {
    return new Promise((resolve) => {
      let req;
      if(customerId !== null){
        req = "SELECT id from business.account_bank where iban = '" + iban + "' and customer_id = '"+customerId+"'";
      }else {
        req = "SELECT id from business.account_bank where iban = '" + iban + "'";
      }

      if(test){
        console.log(req);
      }
      db.runSql(req, null, (err, result) => {

        resolve(result.rows);
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

  function parseString(str){
    while(str.indexOf("'")!== -1){
      str =  str.replace("'","??");
    }
    while(str.indexOf("??")!== -1){
      str =  str.replace("??","''");
    }
    return(str);
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
where invoice_date_formatted:: date >= '2019-09-01' and invoice_date_formatted:: date <= '2019-09-30' and bank.type_account = 'DOM'
order by mandat desc*/
