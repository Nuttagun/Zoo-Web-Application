import { TicketGenerationInterface } from "../interface/ITicketGeneration"
import { TicketTypeInterface } from "../interface/ITicketType"

export interface TicketInterface {
    ID?:                number;
    Description?:       string;
	Price?:             number;
    TicketGeneration?:  TicketGenerationInterface;
    TicketType?:        TicketTypeInterface;
  }