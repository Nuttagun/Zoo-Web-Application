import { EmployeeInterface } from "./IEmployee";

export interface ContainerOfFood { 
  ID: number;
  ContainerName: string; 
}

export interface CatagoryOfFood {  
  ID: number;
  StockfoodType: string; 
  Description: string |undefined;
}

export interface StockOfFood {
  ID: number;  
  Foodname: string;  
  Quantity: number; 
  ExpiryDate: string;  
  PictureOfFood: string; 
  ContainerOfFood?: ContainerOfFood | undefined; 
  CatagoryOfFood?: CatagoryOfFood |undefined;
  Employee?:EmployeeInterface | undefined;  
}


