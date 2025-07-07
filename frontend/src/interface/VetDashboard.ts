import { SexsInterface} from "./ISex"
import { BehavioralInterface} from "./IBehavioral"
import { BiologicalInterface} from "./IBiological"
import { HabitatInterface} from "./IHabitat"
import { HealthInterface} from "./IHealth"

export interface Vetdashboardinterface {
    ID?: number;
    Name?: string;
    Weight?: number;
    Height?: number;
    Birthplace?: string;
    Description?:string;
    BirthDay?: string;
    Picture?: string;
    HealthAnimal?: HealthInterface;
    Note?: string;
    Sex?: SexsInterface;
    Behavioral?: BehavioralInterface;
    Biological?: BiologicalInterface;
    Habitat?: HabitatInterface;
}