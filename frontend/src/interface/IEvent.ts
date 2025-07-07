import { EmployeeInterface} from "./IEmployee"
import { AnimalsInterface} from "./IAnimal"
import { ZoneInterface} from "./IZone"


export interface EventsInterface {
    ID?: number;
    Title?: string;
    Description?: string;
    StartDate?: string;
    EndDate?: string;
    Picture?:string;
    ZoneID?: ZoneInterface;
    AnimalID?: AnimalsInterface;
    EmployeeID?: EmployeeInterface;
  }