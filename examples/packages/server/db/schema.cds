using { Currency, User, managed, cuid } from '@sap/cds/common';
namespace sap.capire.orders;

entity Orders : cuid, managed {
  OrderNo  : String(22) @title:'Order Number'; //> readable key
  Items    : Composition of many OrderItems on Items.order = $self;
  buyer    : User;
  currency : Currency;
}

entity OrderItems : cuid {
    order     : Association to Orders;
    product   : Association to Products;
    quantity  : Integer;
    title     : String; //> intentionally replicated as snapshot from product.title
    price     : Double; //> materialized calculated field
    validFrom : DateTime;
    timestamp : Timestamp;
    date      : Date;
    time      : Time;
}

/** This is a stand-in for arbitrary ordered Products */
entity Products @(cds.persistence.skip:'always') {
  key ID : String;
}


// this is to ensure we have filled-in currencies

