import { SexsInterface} from "./ISex"
import { BehavioralInterface} from "./IBehavioral"
import { BiologicalInterface} from "./IBiological"
import { HabitatInterface} from "./IHabitat"
import { EmployeeInterface} from "./IEmployee"
import { HealthAnimalInterface} from "./IStatusAnimal"

export interface AnimalsInterface {
    ID?: number;
    Name?: string;
    Weight?: number;
    Height?: number;
    Birthplace?: string;
    Description?:string;
    BirthDay?: string;
    Picture?: string;
    Health?: string;
    Note?: string;
    Sex?: SexsInterface;
    Behavioral?: BehavioralInterface;
    Biological?: BiologicalInterface;
    Habitat?: HabitatInterface;
    Employee?: EmployeeInterface;
    HealthAnimal?:HealthAnimalInterface
  }