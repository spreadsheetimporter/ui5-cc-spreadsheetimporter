

////////////////////////////////////////////////////////////////////////////
//
//	Note: this is designed for the OrdersService being co-located with
//	bookshop. It does not work if OrdersService is run as a separate
// 	process, and is not intended to do so.
//
////////////////////////////////////////////////////////////////////////////



using { OrdersService } from '../srv/orders-service';


@odata.draft.enabled
annotate OrdersService.Orders with @(
	UI: {
		SelectionFields: [ createdBy ],
		LineItem: [
			{Value: OrderNo, Label:'{i18n>OrderNo}'},
			{Value: buyer, Label:'{i18n>Customer}'},
			{Value: currency.symbol, Label:'{i18n>Currency}'},
			{Value: createdAt, Label:'{i18n>Date}'},
		],
		HeaderInfo: {
			TypeName: '{i18n>Order}', TypeNamePlural: '{i18n>Orders}',
			Title: {
				Label: '{i18n>OrderNo}', //A label is possible but it is not considered on the ObjectPage yet
				Value: OrderNo
			},
			Description: {Value: createdBy}
		},
		Identification: [ //Is the main field group
			{Value: createdBy, Label:'{i18n>Customer}'},
			{Value: createdAt, Label:'{i18n>Date}'},
			{Value: OrderNo },
		],
		HeaderFacets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Created}', Target: '@UI.FieldGroup#Created'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Modified}', Target: '@UI.FieldGroup#Modified'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: 'Items/@UI.LineItem'},
		],
		FieldGroup#Details: {
			Data: [
				{Value: currency.code, Label:'{i18n>Currency}'}
			]
		},
		FieldGroup#Created: {
			Data: [
				{Value: createdBy},
				{Value: createdAt},
			]
		},
		FieldGroup#Modified: {
			Data: [
				{Value: modifiedBy},
				{Value: modifiedAt},
			]
		},
	},
) {
	createdAt @UI.HiddenFilter:false;
	createdBy @UI.HiddenFilter:false;
        ID        @UI.Hidden;
};



annotate OrdersService.OrderItems with @(
	UI: {
		LineItem: [
			{Value: product_ID, Label:'ID'},
			{Value: title, Label:'{i18n>ProductTitle}'},
			{Value: price, Label:'{i18n>UnitPrice}'},
			{Value: quantity, Label:'{i18n>Quantity}'},
			{Value: validFrom, Label:'{i18n>validFrom}'},
            {Value: timestamp, Label:'{i18n>timestamp}'},
            {Value: date, Label:'{i18n>date}'},
            {Value: time, Label:'{i18n>time}'},
		],
		Identification: [ //Is the main field group
			{Value: quantity, Label:'{i18n>Quantity}'},
			{Value: title, Label:'{i18n>Product}'},
			{Value: price, Label:'{i18n>UnitPrice}'},
			{Value: validFrom, Label:'{i18n>validFrom}'},
            {Value: timestamp, Label:'{i18n>timestamp}'},
            {Value: date, Label:'{i18n>date}'},
            {Value: time, Label:'{i18n>time}'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: '@UI.Identification'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: 'Infos/@UI.LineItem'},
		],
	},
) {
	quantity @(
		Common.FieldControl: #Mandatory
	);
        ID       @UI.Hidden;
        order    @UI.Hidden;

};

annotate OrdersService.OrderItemsInfo with @(
	UI: {
		LineItem: [
			{Value: comment, Label:'comment'}
		],
		Identification: [ //Is the main field group
			{Value: comment, Label:'Comment'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: 'OrderItemsInfo', Target: '@UI.Identification'},
		],
	},
);

annotate OrdersService.OrdersND with @(
	UI: {
		SelectionFields: [ createdBy ],
		LineItem: [
			{Value: OrderNo, Label:'{i18n>OrderNo}'},
			{Value: buyer, Label:'{i18n>Customer}'},
			{Value: currency.symbol, Label:'{i18n>Currency}'},
			{Value: createdAt, Label:'{i18n>Date}'},
		],
		HeaderInfo: {
			TypeName: '{i18n>Order}', TypeNamePlural: '{i18n>Orders}',
			Title: {
				Label: '{i18n>OrderNo}', //A label is possible but it is not considered on the ObjectPage yet
				Value: OrderNo
			},
			Description: {Value: createdBy}
		},
		Identification: [ //Is the main field group
			{Value: createdBy, Label:'{i18n>Customer}'},
			{Value: createdAt, Label:'{i18n>Date}'},
			{Value: OrderNo },
		],
		HeaderFacets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Created}', Target: '@UI.FieldGroup#Created'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Modified}', Target: '@UI.FieldGroup#Modified'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>Details}', Target: '@UI.FieldGroup#Details'},
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: 'Items/@UI.LineItem'},
		],
		FieldGroup#Details: {
			Data: [
				{Value: currency.code, Label:'{i18n>Currency}'}
			]
		},
		FieldGroup#Created: {
			Data: [
				{Value: createdBy},
				{Value: createdAt},
			]
		},
		FieldGroup#Modified: {
			Data: [
				{Value: modifiedBy},
				{Value: modifiedAt},
			]
		},
	},
) {
	createdAt @UI.HiddenFilter:false;
	createdBy @UI.HiddenFilter:false;
        ID        @UI.Hidden;
};



annotate OrdersService.OrderItemsND with @(
	UI: {
		LineItem: [
			{Value: product_ID, Label:'ID'},
			{Value: title, Label:'{i18n>ProductTitle}'},
			{Value: price, Label:'{i18n>UnitPrice}'},
			{Value: quantity, Label:'{i18n>Quantity}'},
			{Value: validFrom, Label:'{i18n>validFrom}'},
            {Value: timestamp, Label:'{i18n>timestamp}'},
            {Value: date, Label:'{i18n>date}'},
            {Value: time, Label:'{i18n>time}'},
		],
		Identification: [ //Is the main field group
			{Value: quantity, Label:'{i18n>Quantity}'},
			{Value: title, Label:'{i18n>Product}'},
			{Value: price, Label:'{i18n>UnitPrice}'},
			{Value: validFrom, Label:'{i18n>validFrom}'},
            {Value: timestamp, Label:'{i18n>timestamp}'},
            {Value: date, Label:'{i18n>date}'},
            {Value: time, Label:'{i18n>time}'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: '{i18n>OrderItems}', Target: '@UI.Identification'},
		],
	},
) {
	quantity @(
		Common.FieldControl: #Mandatory
	);
        ID       @UI.Hidden;
        order    @UI.Hidden;

};

annotate OrdersService.OrderItemsInfoND with @(
	UI: {
		LineItem: [
			{Value: comment, Label:'comment'}
		],
		Identification: [ //Is the main field group
			{Value: comment, Label:'Comment'},
		],
		Facets: [
			{$Type: 'UI.ReferenceFacet', Label: 'OrderItemsInfo', Target: '@UI.Identification'},
		],
	},
);