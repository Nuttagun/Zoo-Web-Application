export interface StockOfFood {
  ID: number;
  Foodname: string;
  Quantity: number;
  CatagoryOfFood?: {
    ID: number;
    StockfoodType: string;
  };
}

export interface FoodRequisitionDetail {
  ID: number;
  Quantity: number;
  StockOfFoodID: number;
  StockOfFood?: StockOfFood;
}

export interface FoodRequisition {
  Note: string;
  RequisitionDate: string;
  WorkID: number | undefined;
  Work: {
    Habitat: {
      Name: string;
    };
    Employee: {
      User: {
        FirstName: string;
        LastName: string;
        Email: string;
      };
    };
  };
  Details: {
    StockOfFoodID: number;
    StockOfFood: {
      Foodname: string;
      CatagoryOfFood: {
        StockfoodType: string;
      };
    };
    Quantity: number;
  }[];
}
