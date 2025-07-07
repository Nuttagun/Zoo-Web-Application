import { EmployeeInterface } from "./IEmployee";
import { UsersInterface } from "./IUser";

export interface ChatInterface {
  ID?: number;
  // SendMassage?: string;
  massage?:string;
  TimeSend?: Date;
  EmployeeID?: number; //FK
  Employee?: EmployeeInterface;

  UserID?:number;
  User?:UsersInterface
}

//send_massage