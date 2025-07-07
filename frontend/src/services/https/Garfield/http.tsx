import axios from "axios";
import { LoginInterface } from "../../../interface/Login";
import { UsersInterface } from "../../../interface/IUser";
import { EmployeeInterface } from "../../../interface/IEmployee";

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

const formDataRequestOptions = (method: string, formData: FormData) => {
  const Authorization = localStorage.getItem("token");
  const Bearer = localStorage.getItem("token_type");

  return {
    method: method,
    headers: {
      Authorization: `${Bearer} ${Authorization}`,
    },
    body: formData,
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

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("token") || "";
  const tokenType = localStorage.getItem("token_type") || "Bearer";
  return {
    Authorization: `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}

const requestOptions = {
  headers: getAuthHeaders(),
};

async function AddLogin(data: LoginInterface) {
  return await axios
    .post(`${apiUrl}/login`, data, requestOptions)
    .then((res) => res)
    .catch((e) => e.response);
}

const CreateUser = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const response = await axios.post(`${apiUrl}/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201) {
      throw new Error("Error creating user");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    return false;
  }
};

async function GetUsers() {
  const requestOptions = getRequestOptions();
  let res = await fetch(`${apiUrl}/users`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return false;
      }
    });

  return res;
}

// async function GetUserById(id: string) {
//   return await axios
//     .get(`${apiUrl}/users/${id}`, { headers: getAuthHeaders() })
//     .then((res) => res)
//     .catch((e) => e.response);
// }
const GetUserById = async (
  id: number | undefined
): Promise<UsersInterface | false> => {
  
  try {
    const response = await fetch(`${apiUrl}/users/${id}`, getRequestOptions());

    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 401) {
      alert("Unauthorized! Please login again.");
      return false;
    } else {
      console.error(`Error: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูล User ตาม ID:", error);
    return false;
  }
};


// async function UpdateUserById(id: string, data: UsersInterface) {
//   return await axios
//     .put(`${apiUrl}/users/${id}`, data, { headers: getAuthHeaders() })
//     .then((res) => res)
//     .catch((e) => e.response);
// }

async function UpdateUserbyId(data: UsersInterface, file?: File) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof UsersInterface] as string);
  }
  
  // Append file if provided
  if (file) {
    formData.append("Profile", file);
  }

  console.log("Data User update:", data);

  // Use a function for request options
  const requestOptions = formDataRequestOptions("PATCH", formData);

  try {
    // API request to update user by ID
    const res = await fetch(`${apiUrl}/users-update/${data.ID}`, requestOptions);

    if (res.status === 200) {
      return await res.json(); // Return response data if successful
    } else {
      return false; // Return false for unsuccessful response
    }
  } catch (error) {
    console.error("Error updating user:", error);
    return false;
  }
}

export async function UpdateUserAndEmployee(data: EmployeeInterface, file?: File) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof EmployeeInterface] as string);
  }

  if (file) {
    formData.append("Picture", file);
  }
  console.log("Data Animal update", data);
  const requestOptions = formDataRequestOptions("PATCH", formData);

  try {
    const res = await fetch(`${apiUrl}/userandemployee-update/${data.ID}`, requestOptions);
    if (res.status === 200) {
      return await res.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating animal:", error);
    return false;
  }
}




async function UpdatePasswordById(
  id: string,
  data: { old_password: string; new_password: string; confirm_password: string }
) {
  return await axios
    .put(`${apiUrl}/users/password/${id}`, data, { headers: getAuthHeaders() })
    .then((res) => res)
    .catch((e) => e.response);
}

async function DeleteUserById(id: Number | undefined) {
  const requestOptions = deleteRequestOptions();

  let res = await fetch(`${apiUrl}/userandemployee-delete/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    });

  return res;
}

const CreateUserByAdmin = async (formData: FormData): Promise<any | false> => {
  console.log("Form Data:", formData);
  const requestOptions = postRequestOptions(formData);
  try {
    const response = await fetch(`${apiUrl}/users-createbyadmin`, requestOptions);
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

const UpdateUserByAdmin = async (id: string, formData: FormData): Promise<any | false> => {
  console.log("Form Data:", formData);

  // ตั้งค่าการร้องขอ HTTP แบบ PUT
  const requestOptions = {
    method: "POST",
    headers: {
      "Authorization": "Bearer YOUR_TOKEN_HERE", // เพิ่ม Token หากจำเป็น
    },
    body: formData,
  };

  try {
    // ส่งคำขอไปที่ API สำหรับการอัปเดตข้อมูล
    const response = await fetch(`${apiUrl}/users-updatebyadmin/${id}`, requestOptions);
    const result = await response.text();
    console.log("Server response:", result);

    if (!response.ok) {
      throw new Error(result || "ไม่สามารถอัปเดตข้อมูลได้");
    }

    // แปลงผลลัพธ์เป็น JSON และส่งคืน
    return JSON.parse(result);
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการอัปเดตข้อมูล:", error);
    return false;
  }
};


async function GetGender() {
  try {
    const response = await axios.get(`${apiUrl}/genders`, {
      headers: getAuthHeaders(),
    });
    return response.data; // สมมติว่า API ส่งข้อมูล genders กลับมาใน response.data
  } catch (error) {
    console.error("Error fetching genders:", error);
    return [];
  }
}

export const GetEmployeeByUserID = async (
  id: number | string
): Promise<EmployeeInterface | false> => {
  try {
    const response = await axios.get(`${apiUrl}/employee/${id}`, {
      headers: getHeaders(),
    });

    console.log("Response from API:", response.data); 
    return response.data.employeeID; 
  } catch (error: any) {
    console.error(
      "Error fetching EmployeeID:",
      error.response?.data || error.message
    );
    return false; 
  }
};

export const GetEmployee2ById = async (
  userIDD: number | string
): Promise<EmployeeInterface | false> => {
  try {
    const response = await axios.get(`${apiUrl}/employeebyid/${userIDD}`, {
      headers: getHeaders(),
    });

    console.log("Response from API:", response.data); 
    return response.data; 
  } catch (error: any) {
    console.error(
      "Error fetching EmployeeID:",
      error.response?.data || error.message
    );
    return false; 
  }
};

export async function GetUserRole() {
  try {
    const response = await axios.get(`${apiUrl}/userrole`, {headers: getAuthHeaders(),});
    return response.data; 
  } catch (error) {
    console.error("Error fetching userrole:", error);
    return [];
  }
}

export const UpdatePaymentStatus = async (id: number, status: boolean) => {
  try {
    const response = await fetch(`http://localhost:8000/api/payments/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ PaymentStatus: status }),
    });
    return response.json();
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

export {
  AddLogin,
  CreateUser,
  GetUserById,
  UpdateUserbyId,
  GetUsers,
  DeleteUserById,
  UpdatePasswordById,
  CreateUserByAdmin,
  GetGender,
  UpdateUserByAdmin,
};
