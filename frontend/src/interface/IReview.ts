import { RcFile } from "antd/es/upload/interface";

export interface ReviewInterface {
    ID?: number;
    Rating?: number;
    Comment?: string;
    ReviewDate?: Date;
    Picture?: RcFile | undefined;  
    UserID?: number; 
    isRemovePicture?: boolean; 
  }

  export interface UserReviews {
    ID?: number;
    Username?: string;
    Password?: string;
    Email?: string;
    FirstName?: string;
    LastName?: string;
    BirthDay?: string;
    Profile?: string;
    UserRoleID?: number;
    GenderID?: number;
  }