using { sap.capire.orders as my } from '../db/schema';

service OrdersService {
  entity Orders as projection on my.Orders;
  entity OrderItems as projection on my.OrderItems;
}
