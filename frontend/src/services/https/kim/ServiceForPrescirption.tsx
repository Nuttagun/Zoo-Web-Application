import axios from "axios";
import {  CreateMedicineInterface, CreateMedicineType, Medicine, MedicineType } from "../../../interface/IMedicalrecord";
// กำหนด URL ของ API
const apiUrl = "http://localhost:8000";



export const ListPrescriptions = async () => {
    try {
      // เรียก API เพื่อดึงข้อมูล
      const response = await axios.get(`${apiUrl}/getallprescription`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`, // ใส่ token สำหรับ Authentication
          "Content-Type": "application/json",
        },
      });
  
      // ตรวจสอบผลลัพธ์จาก API
      if (response.status === 200) {
        console.log("API Response:", response.data); // ตรวจสอบข้อมูลที่ได้รับ
        return response.data; // ส่งข้อมูลกลับ
      } else {
        console.error(`Unexpected status code: ${response.status}`);
        throw new Error("Unexpected response from server");
      }
    } catch (error: any) {
      // ตรวจสอบข้อผิดพลาด
      if (error.response) {
        // ข้อผิดพลาดที่เกิดจากการตอบสนองของเซิร์ฟเวอร์
        console.error(
          `Server Error: ${error.response.status} - ${error.response.data}`
        );
        throw new Error(
          `Failed to fetch prescriptions: ${error.response.data.error || "Unknown error"}`
        );
      } else if (error.request) {
        // ข้อผิดพลาดที่เกิดจากไม่มีการตอบกลับ
        console.error("No response received from server:", error.request);
        throw new Error("No response from server");
      } else {
        // ข้อผิดพลาดอื่น ๆ
        console.error("Error in request setup:", error.message);
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  };
  


export const deletePrescriptionById = async (id: string) => {
    try {
      const response = await axios.delete(`${apiUrl}/deleteprescriptionbyid/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
      return response.data;
    } catch (error) {
      console.error("Error deleting Prescription:", error);
      throw error; // Forward error for further handling
    }
  };

  export const deleteMedicineById = async (id: string) => {
    try{
      const response = await axios.delete(`${apiUrl}/deletemedicinebyid/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
    });
      return response.data;
    }
    catch (error){
      console.error("Error deleting Medicine:", error);
      throw error;
    }
  }

  export const updateMedicineById = async (id: number, updateData: Medicine) => {
    try{
      const response = await axios.put(`${apiUrl}/updatemedicinebyid/${id}`, updateData, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
    });
      return response.data;
    }
    catch (error){
      console.error("Error updating Medicine:", error);
      throw error;
    }
  }

  

  export const getMedicineById = async (id: number): Promise<Medicine> => {
    try {
      const response = await axios.get(`${apiUrl}/getmedicinebyid/${id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
  
      return response.data as Medicine;
    } catch (error) {
      console.error("Error fetching medicine by ID:", error);
      throw new Error("Failed to fetch medicine");
    }
  };

export const ListMedicineType = async () => {
  try {
    const response = await axios.get(`${apiUrl}/listmedicinetype`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching medicine types:", error);
    throw new Error("Failed to fetch medicine types");
  }
};
  

export const createMedicine = async (newMedicine: CreateMedicineInterface) => {
  try {
    const response = await axios.post(`${apiUrl}/addmedicine`, newMedicine, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw new Error("Failed to create medicine");
  }
};

export const deleteMedicineTypeById = async (id: string) => {
  try{
    const response = await axios.delete(`${apiUrl}/deletemedicinetypebyid/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
  });
    return response.data;
  }
  catch (error){
    console.error("Error deleting MedicineType:", error);
    throw error;
  }
}

export const updateMedicineTypeByID = async (id: number, updateData: MedicineType) => {
  try{
    const response = await axios.put(`${apiUrl}/updatemedicinetypebyid/${id}`, updateData, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
  });
    return response.data;
  }
  catch (error){
    console.error("Error updating Medicine:", error);
    throw error;
  }
}

export const createMedicineType = async (newMedicineType: CreateMedicineType) => {
  try {
    const response = await axios.post(`${apiUrl}/addmedicinetype`, newMedicineType, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw new Error("Failed to create medicine");
  }
};

export const getMedicineTypeById = async (id: number): Promise<MedicineType> => {
  try {
    const response = await axios.get(`${apiUrl}/listmedicinetypebyid/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as MedicineType;
  } catch (error) {
    console.error("Error fetching medicine by ID:", error);
    throw new Error("Failed to fetch medicine");
  }
};
