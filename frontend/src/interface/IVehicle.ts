import { EmployeeInterface } from "../interface/IEmployee"
import { VehicleTypeInterface } from "../interface/IVehicleType"
import { VehicleStatusInterface } from "./IVehicleStatus";
import { VehicleColorInterface } from "./IVehicleColor";

export interface VehicleInterface {
    ID?:                  number;
    Name?:                string;
    Price?:               number;
    QuantityVehicle?:     number;
    ReceivedDate?:        string;
    Picture?:             string;
    Color?:               VehicleColorInterface;
    VehicleStatus?:       VehicleStatusInterface; 
    VehicleType?:         VehicleTypeInterface;
    Employee?:            EmployeeInterface;
  }