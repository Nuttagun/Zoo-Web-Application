import { EmployeeInterface } from "./IEmployee";

export interface PromotionInterface {
  ID?: number;  //PK
  PromotionName?: string; //
  // PromotionPicture?: string; //
  StartDate?: Date; //
  EndDate?: Date; //
  Discount?: number; //
  Description?: string; //
  NumberPromotionUse?: number; //

  VisitDate?: Date ; //
  EndVisitDate?: Date ; //

  PromotionStatusID?: number; //FK
  PromotionStatus?: PromotionStatusInterface;

  ConditionID?: number; //FK
  Condition?: ConditionInterface;

  PromotionCategoryID?: number; //FK
  PromotionCategory?: PromotionCategoryInterface;

  EmployeeID?: number;  //FK
  Employee?: EmployeeInterface;
}

export interface PromotionStatusInterface {
  ID?: number;  //PL
  SName?: string;
  ParentID?: number;
  Parent?: PromotionStatusInterface ;
}

export interface ConditionInterface {
  ID?: number;  //PK
  ConName?: string;
  MinChild?: number;
  MaxChild?: number ;

  MinAdult?: number;
  MaxAdult?: number ;

  MinOther?: number;
  MaxOther?: number ;

  ParentID?: number ;
  Parent?: ConditionInterface ;
}

export interface PromotionCategoryInterface {
  ID?: number;  //PK
  CName?: string;
  ParentID?: number | null;
  Parent?: PromotionCategoryInterface;
}
