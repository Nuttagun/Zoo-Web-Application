import { VehicleInterface } from "../../../interface/IVehicle";
import { BookingInterface } from "../../../interface/IBooking";
import { TicketBookedInterface } from "../../../interface/ITicketBooking";
import { BookingZooInterface } from "../../../interface/IBookingZoo";
import { RentInterface } from "../../../interface/IRent";
import { UsersInterface } from "../../../interface/IUser";
import axios from "axios";

const apiUrl = "http://localhost:8000";

const getRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};

const deleteRequestOptions = () => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    },
  };
};


const postRequestOptions = (body: any) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");

  let headers: Record<string, string> = {
    Authorization: `${Bearer} ${Authorization}`,
  };

  if (!(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  return {
    method: "POST",
    headers: headers, 
    body: body instanceof FormData ? body : JSON.stringify(body), 
  };
};

const getHeaders = (): Record<string, string> => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");
  return {
    "Content-Type": "application/json",
    Authorization: `${Bearer} ${Authorization}`,
  };
};



export const CreateVehicle = async (formData: FormData): Promise<any | false> => {
  console.log("Form Data:", formData);

  const requiredFields = [
    "name",
    "price",
    "receivedDate",
    "description",
    "vehicleColorID",
    "vehicleTypeID",
    "employeeID",
  ];

  for (const field of requiredFields) {
    if (!formData.get(field)) {
      console.error(`Missing required field: ${field}`);
      throw new Error(`กรุณากรอกข้อมูลให้ครบถ้วน: ${field}`);
    }
  }

  const price = Number(formData.get("price"));
  if (isNaN(price) || price <= 0 || price > 500) {
    throw new Error("กรุณาระบุค่าเช่ารถที่ถูกต้อง (1 - 500 บาท)");
  }

  const name = formData.get("name")?.toString().trim();
  if (!name || name.length > 20) {
    throw new Error("ชื่อรถต้องไม่ว่างและต้องไม่เกิน 20 ตัวอักษร");
  }

  const description = formData.get("description")?.toString().trim();
  if (!description || description.length > 100) {
    throw new Error("คำอธิบายรถต้องไม่ว่างและต้องไม่เกิน 100 ตัวอักษร");
  }

  const receivedDate = formData.get("receivedDate");
  if (!receivedDate || !/^\d{4}-\d{2}-\d{2}$/.test(receivedDate.toString())) {
    throw new Error("กรุณาระบุวันที่รับรถในรูปแบบ YYYY-MM-DD");
  }

  const vehicleColorID = formData.get("vehicleColorID");
  if (!vehicleColorID || isNaN(Number(vehicleColorID))) {
    console.error("Missing or invalid vehicle color ID:", vehicleColorID);
    throw new Error("กรุณาระบุสีของยานพาหนะให้ถูกต้อง");
  }

  const vehicleTypeID = formData.get("vehicleTypeID");
  if (!vehicleTypeID || isNaN(Number(vehicleTypeID))) {
    throw new Error("กรุณาระบุประเภทของยานพาหนะให้ถูกต้อง");
  }

  const requestOptions = postRequestOptions(formData);
  try {
    const response = await fetch(`${apiUrl}/vehicles-create`, requestOptions);
    const result = await response.text(); 
    console.log("Server response:", result);
    if (!response.ok) {
      throw new Error(result || "ไม่สามารถสร้างข้อมูลได้");
    }
    return JSON.parse(result);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างข้อมูล:", error);
  }    
};


async function GetVehicle() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/vehicles`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

async function DeleteVehicleByID(id: Number | undefined) {
  const requestOptions = deleteRequestOptions();

  let res = await fetch(`${apiUrl}/vehicles/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    });

  return res;
}

async function UpdateVehicle(data: VehicleInterface, file?: File) {
  if (file) {
    const isImage = file.type.startsWith("image/"); 
    const isLt2M = file.size / 1024 / 1024 < 2; 

    if (!isImage) {
      console.error("กรุณาอัปโหลดไฟล์ภาพเท่านั้น");
      return false;
    }

    if (!isLt2M) {
      console.error("ขนาดไฟล์เกิน 2MB");
      return false;
    }
  }

  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof VehicleInterface] as string);
  }

  if (file) {
    formData.append("Picture", file);
  }
  console.log(file)
  console.log(data)

  console.log("Test formdata: ",formData);

  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");

  const requestOptions = {
    method: "PATCH",
    headers: {
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: formData,
  };

  let res = await fetch(`${apiUrl}/vehicles/${data.ID}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

async function GetVehicleById(id: Number | undefined) {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/vehicles/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}


export const CreateBooking = async (bookingData: BookingInterface): Promise<any | false> => {
  try {
    const requestOptions = postRequestOptions(bookingData); 
    const response = await fetch(`${apiUrl}/booking`, requestOptions);

    if (response.status !== 201) {
      const errorText = await response.text(); 
      console.error("API error response:", errorText);
      throw new Error("ไม่สามารถสร้างข้อมูลการจองได้");
    }

    return await response.json();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการสร้างข้อมูลการจอง:", error);
    return false;
  }
};

export async function DeleteBooking(userId: number | undefined): Promise<boolean> {
  if (!userId) {
    console.error("User ID is required to delete booking");
    return false;
  }

  const endpoint = `${apiUrl}/deletebooking?user_id=${userId}`;
  const options = deleteRequestOptions();

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Failed to delete booking. Status: ${response.status}, Error: ${errorData.error || "Unknown error"}`);
      return false;
    }

    console.log("Booking deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting booking:", error);
    return false;
  }
}

export const GetTicketTypes = async (): Promise<any | false> => {
  try {
    const Authorization = localStorage.getItem("token");
    const Bearer = localStorage.getItem("token_type");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    };

    const response = await axios.get(`${apiUrl}/ticket-types`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return false;
  }
}; 

export const GetTicketsByTicketTypeID = async (ticketTypeID: number): Promise<any | false> => {
  try {
    const Authorization = localStorage.getItem("token");
    const Bearer = localStorage.getItem("token_type");

    const headers = {
      "Content-Type": "application/json",
      Authorization: `${Bearer} ${Authorization}`,
    };

    const response = await axios.get(`${apiUrl}/tickets/${ticketTypeID}`, { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching tickets by TicketTypeID:", error);
    return false;
  }
}; 

export const createTicketBooked = async (
  ticketBookedData: TicketBookedInterface
): Promise<any | false> => {
  if (
    !ticketBookedData.VisitDate ||
    isNaN(Date.parse(ticketBookedData.VisitDate))
  ) {
    console.error("Invalid VisitDate:", ticketBookedData.VisitDate);
    return false;
  }

  if (
    typeof ticketBookedData.QuantityCustomer !== "number" ||
    ticketBookedData.QuantityCustomer < 1
  ) {
    console.error(
      "Invalid QuantityCustomer:",
      ticketBookedData.QuantityCustomer
    );
    return false;
  }

  if (
    typeof ticketBookedData.TotalPrice !== "number" ||
    ticketBookedData.TotalPrice < 0
  ) {
    console.error("Invalid TotalPrice:", ticketBookedData.TotalPrice);
    return false;
  }

  if (
    typeof ticketBookedData.BookingID !== "number" ||
    ticketBookedData.BookingID <= 0
  ) {
    console.error("Invalid BookingID:", ticketBookedData.BookingID);
    return false;
  }

  try {
    const requestOptions = {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(ticketBookedData),
    };

    const response = await fetch(`${apiUrl}/ticket-booked`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to create TicketBooked");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating TicketBooked:", error);
    return false;
  }
}; 


async function DeleteTicketBookedByID(id: number | undefined): Promise<boolean> {
  if (id === undefined) {
    console.error("Invalid TicketBooked ID");
    return false;
  }

  const requestOptions = deleteRequestOptions();

  try {
    const res = await fetch(`${apiUrl}/deleteTicketBooked/${id}`, requestOptions);

    if (!res.ok) {
      console.error(`Failed to delete TicketBooked. Status: ${res.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting TicketBooked:", error);
    return false;
  }
}



export const createBookingZoo = async (
  bookingZooData: BookingZooInterface
): Promise<any | false> => {
  if (!bookingZooData.Quantity || bookingZooData.Quantity <= 0) {
    console.error("Invalid quantity. It must be greater than 0.");
    return false;
  }

  if (!bookingZooData.TicketID) {
    console.error("TicketID is missing or invalid.");
    return false;
  }

  if (!bookingZooData.TicketBookedID) {
    console.error("TicketBookedID is missing or invalid.");
    return false;
  }
  
  try {
    const requestOptions = {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(bookingZooData),
    };

    const response = await fetch(`${apiUrl}/booking-zoo`, requestOptions);
    if (!response.ok) {
      throw new Error("Failed to create BookingZoo");
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating BookingZoo:", error);
    return false;
  }
}; 


export const getAvailableVehicles = async (
  rentDate: string,
  startTime: string, 
  endTime: string
): Promise<any> => {
  try {
    const response = await axios.get(`${apiUrl}/vehicles/available`, {
      headers: getHeaders(),
      params: {
        rentDate, 
        startTime,
        endTime, 
      },
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching available vehicles:", error);

    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.error || "Failed to fetch available vehicles"
      );
    } else {
      throw new Error("Network error or unknown issue occurred");
    }
  }
}; 

export const createTicketRented = async (
  rentData: RentInterface
): Promise<any | false> => {
  if (rentData.TotalQuantity && rentData.TotalQuantity <= 0) {
    return "Total quantity must be greater than 0.";
  }
  if (!rentData.RentDate || isNaN(new Date(rentData.RentDate).getTime())) {
    return "Invalid rent date.";
  }
  if (!rentData.StartTime || !rentData.EndTime) {
    return "Start time and end time are required.";
  }
  if (new Date(rentData.StartTime) >= new Date(rentData.EndTime)) {
    return "Start time must be earlier than end time.";
  }
  if (rentData.TotalPrice === undefined || rentData.TotalPrice < 0) {
    return "Total price must be 0 or greater.";
  }
  if (!rentData.TicketBookedID) {
    return "TicketBookedID is required.";
  }

  try {
    const response = await axios.post(`${apiUrl}/rent`, rentData, {
      headers: getHeaders(),
    });

    if (response.status === 201) {
      console.log("Rent created successfully:", response.data);
      return response.data; 
    } else {
      console.error("Failed to create Rent:", response.data);
      return false;
    }
  } catch (error: any) {
    console.error("Error creating Rent:", error.response?.data || error.message);
    return false;
  }
};


export const createVehicleRent = async (
  vehicleRents: { Quantity?: number; RentID: number; VehicleID?: number }[] 
): Promise<any> => {
  if (!Array.isArray(vehicleRents) || vehicleRents.length === 0) {
    throw new Error("VehicleRents must be a non-empty array.");
  }

  for (const rent of vehicleRents) {
    if (!rent.RentID || typeof rent.RentID !== "number") {
      throw new Error("Each VehicleRent entry must have a valid RentID (number).");
    }

    if (rent.VehicleID && typeof rent.VehicleID !== "number") {
      throw new Error("Each VehicleRent entry must have a valid VehicleID (number).");
    }
    if (rent.VehicleID && rent.Quantity) {  
      if (typeof rent.Quantity !== "number" || rent.Quantity <= 0 || !Number.isInteger(rent.Quantity)) {
        throw new Error("Each VehicleRent entry must have a positive integer Quantity.");
      }
    }
  }

  try {
    const response = await axios.post(`${apiUrl}/vehicle-rent`, vehicleRents, {
      headers: getHeaders(),
    });
    return response.data; 
  } catch (error: any) {
    console.error("Error creating VehicleRent:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error || "Failed to create VehicleRent."
    );
  }
};


export const updateBookingByID = async (
  bookingID: number,
  updateData: Partial<BookingInterface>
): Promise<any | false> => {
  try {
    const response = await axios.patch(
      `${apiUrl}/bookings/${bookingID}`,
      updateData,
      {
        headers: getHeaders(),
      }
    );

    if (response.status === 200) {
      console.log("Booking updated successfully:", response.data);
      return response.data; 
    } else {
      console.error("Failed to update booking:", response.data);
      return false;
    }
  } catch (error: any) {
    console.error("Error updating booking:", error.response?.data || error.message);
    return false;
  }
}; 

export const getAllVehicleTypes = async (): Promise<any[] | false> => {
  try {
    const response = await axios.get(`${apiUrl}/vehicle-types`, {
      headers: getHeaders(),
    });

    console.log("Vehicle types retrieved successfully:", response.data);
    return response.data.data; 
  } catch (error: any) {
    console.error("Error fetching vehicle types:", error.response?.data || error.message);
    return false; 
  }
};

export const getAllVehicleColors = async (): Promise<any[] | false> => {
  try {
    const response = await axios.get(`${apiUrl}/vehicle-colors`, {
      headers: getHeaders(),
    });

    console.log("Vehicle colors retrieved successfully:", response.data);
    return response.data.data; 
  } catch (error: any) {
    console.error("Error fetching vehicle colors:", error.response?.data || error.message);
    return false; 
  }
};

export const getAllVehicleStatus = async (): Promise<any[] | false> => {
  try {
    const response = await axios.get(`${apiUrl}/vehicle-status`, {
      headers: getHeaders(),
    });

    console.log("Vehicle status retrieved successfully:", response.data);
    return response.data.data; 
  } catch (error: any) {
    console.error("Error fetching vehicle status:", error.response?.data || error.message);
    return false; 
  }
};

export const getUserBookingDetails = async (userId: string) => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/booking-detail-tickets/user/${userId}`, { headers });
    return response.data; 
  } catch (error: any) {
    console.error("Error fetching user booking details:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch booking details");
  }
};

export const getTicketBookedByID = async (ticketID: number) => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/ticket-booked/${ticketID}`, { headers });
    return response.data.ticketBooked; 
  } catch (error: any) {
    console.error("Error fetching TicketBooked by ID:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch TicketBooked details");
  }
};

export const getTicketByID = async (ticketID: number) => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/ticket/${ticketID}`, { headers });
    return response.data.ticket; 
  } catch (error: any) {
    console.error(`Error fetching Ticket by ID ${ticketID}:`, error);
    throw new Error(error.response?.data?.error || "Failed to fetch Ticket details");
  }
};

export const getUserBookingDetailsRent = async (userId: string) => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/booking-detail-rent/user/${userId}`, { headers });
    return response.data; 
  } catch (error: any) {
    console.error("Error fetching user booking rent details:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch booking rent details");
  }
};

export const getRentByID = async (rentId: string | number): Promise<any> => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/rent/${rentId}`, { headers });
    return response.data.rent; 
  } catch (error: any) {
    console.error("Error fetching rent details:", error);
    throw new Error(error.response?.data?.error || "Failed to fetch rent details");
  }
};

export const GetTicketTypeByID = async (ticketTypeID: number): Promise<any | false> => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/tickettypes/${ticketTypeID}`, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching TicketType with ID ${ticketTypeID}:`, error.response?.data || error.message);
    return false;
  }
};

export const getUserById = async (id: string): Promise<UsersInterface> => {
  try {
    const requestOptions = getRequestOptions();
    const response = await axios.get<UsersInterface>(`${apiUrl}/users/${id}`, requestOptions);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw new Error("Error fetching user by ID: " + (error as Error).message);
  }
};

export const getTicketBookedByBookingID = async (bookingID: number): Promise<any | false> => {
  try {
    const headers = getHeaders();
    const response = await axios.get(`${apiUrl}/tickets/booked/${bookingID}`, { headers });

    return response.data.ticketsBooked;
  } catch (error: any) {
    console.error(`Error fetching TicketBooked by BookingID ${bookingID}:`, error);
    throw new Error(
      error.response?.data?.error || "Failed to fetch TicketBooked details by BookingID"
    );
  }
};

export const getRentsByTicketBookedID = async (
  ticketBookedID: number
): Promise<any> => {
  if (!ticketBookedID || typeof ticketBookedID !== "number") {
    throw new Error("Invalid TicketBookedID. It must be a valid number.");
  }

  try {
    const response = await axios.get(`${apiUrl}/rents/ticketbooked/${ticketBookedID}`, {
      headers: getHeaders(),
    });

    return response.data.rents;
  } catch (error: any) {
    console.error(
      `Error fetching rents by TicketBookedID ${ticketBookedID}:`,
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.error || "Failed to fetch rents by TicketBookedID"
    );
  }
};

export {
  GetVehicle,
  DeleteVehicleByID,
  UpdateVehicle,
  GetVehicleById,
  DeleteTicketBookedByID,
};
