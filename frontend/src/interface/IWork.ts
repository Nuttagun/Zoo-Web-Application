import { HabitatInterface } from "../interface/IHabitat"

export interface WorkInterface {
    ID?: number;
    feed: boolean;
    cleaning: boolean;
    finish_date: string; 
    employee_id: number;
    habitat_id: number;
    Habitat?: HabitatInterface;
    FinishDate:string;
    createdAt?: string;
    updatedAt?: string;
  }

  export interface WorkResponse {
    data: WorkInterface;
    message: string;
  }