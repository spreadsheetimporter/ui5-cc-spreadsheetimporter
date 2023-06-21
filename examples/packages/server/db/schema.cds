using {
  Currency,
  User,
  managed,
  cuid
} from '@sap/cds/common';

namespace sap.capire.orders;

entity Orders : cuid, managed {
  OrderNo  : String(22) @title: 'Order Number'; //> readable key
  Items    : Composition of many OrderItems
               on Items.order = $self;
  Shipping : Composition of many ShippingDetails
              on Shipping.order = $self;
  buyer    : User;
  currency : Currency;
}

entity OrderItems : cuid {
  order     : Association to Orders;
  product   : Association to Products;
  Infos : Composition of many OrderItemsInfo
               on Infos.orderItem = $self;
  quantity  : Integer;
  title     : String; //> intentionally replicated as snapshot from product.title
  price     : Double; //> materialized calculated field
  validFrom : DateTime;
  timestamp : Timestamp;
  date      : Date;
  time      : Time;
  boolean   : Boolean;
  decimal   : Decimal(15, 3);
}

entity OrderItemsInfo : cuid {
  orderItem     : Association to OrderItems;
  comment       : String;
}

entity ShippingDetails : cuid {
  order         : Association to Orders;
  address       : String;
  city          : String;
  state         : String;
  postalCode    : String;
  country       : String;
  shipmentDate  : DateTime;
  arrivalDate   : DateTime;
  shipmentStatus: String;
}

/**
 * This is a stand-in for arbitrary ordered Products
 */
entity Products @(cds.persistence.skip: 'always') {
  key ID : String;
}


entity OrdersND : cuid, managed {
  OrderNo  : String(22) @title: 'Order Number'; //> readable key
  Items    : Composition of many OrderItemsND
               on Items.order = $self;
  buyer    : User;
  currency : Currency;
}

entity OrderItemsND : cuid {
  order     : Association to OrdersND;
  product   : Association to ProductsND;
  Infos : Composition of many OrderItemsInfoND
               on Infos.orderItem = $self;
  quantity  : Integer;
  title     : String; //> intentionally replicated as snapshot from product.title
  price     : Double; //> materialized calculated field
  validFrom : DateTime;
  timestamp : Timestamp;
  date      : Date;
  time      : Time;
  boolean   : Boolean;
  decimal   : Decimal(15, 3);
}

entity OrderItemsInfoND : cuid {
  orderItem     : Association to OrderItemsND;
  comment       : String;
}

/**
 * This is a stand-in for arbitrary ordered Products
 */
entity ProductsND @(cds.persistence.skip: 'always') {
  key ID : String;
}
