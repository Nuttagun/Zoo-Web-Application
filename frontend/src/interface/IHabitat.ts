import { ZoneInterface} from "./IZone"

export interface HabitatInterface {
    ID?: number;
    Name?: string;
    Size?: number;
    Capacity?: number;
    Picture?: string;
    ZoneID?: number; 
    Zone?: ZoneInterface | string; 
  }
  