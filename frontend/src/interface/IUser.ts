import { ReactNode } from "react";
import { EmployeeInterface } from "../interface/IEmployee"

export interface UsersInterface {
    PhoneNumber: ReactNode;
    ID?: number;
    Username?: string;
    Password?: string;
    Email?: string;
    FirstName?: string;
    LastName?: string;
    BirthDay?: string;
    Profile?: string ;
    UserRoleID?: number;
    GenderID?: number;
    Phonenumber?: string;
    Employee?: EmployeeInterface;
  }