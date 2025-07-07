import axios from "axios";
import { StockOfFood } from "../../../interface/IStockOfFoodInterface";

const apiUrl = "http://localhost:8000";

// ฟังก์ชันดึงข้อมูลทั้งหมดของ StockOfFood
export async function getAllStocks(): Promise<StockOfFood[] | false> {
  try {
    const response = await axios.get(`${apiUrl}/getfood`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data as StockOfFood[];
  } catch (error) {
    console.error("Error fetching stock of food:", error);
    throw new Error("Unable to fetch food stock.");
  }
}

export const GetFoodById = async (
  id: number | undefined
): Promise<StockOfFood | false> => {
  try {
    const response = await fetch(`${apiUrl}/getfoodid/${id}`, getRequestOptions()); 

    if (response.status === 200) {
      return await response.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการดึงข้อมูลสัตว์ตาม ID:", error);
    return false;
  }
};


export const CreateFood = async (
  formData: FormData
): Promise<any | false> => {
  try {
    const response = await axios.post(`${apiUrl}/addfood`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `${localStorage.getItem(
          "token_type"
        )} ${localStorage.getItem("token")}`,
      },
    });

    if (response.status !== 201) {
      throw new Error("Error creating food");
    }

    return response.data;
  } catch (error) {
    console.error("Error creating food:", error);
    return false;
  }
};

// ฟังก์ชันอัปเดตข้อมูล StockOfFood
export async function UpdateFood(data: StockOfFood, file?: File) {
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key as keyof StockOfFood] as string);
  }

  if (file) {
    formData.append("PictureOfFood", file);
  }
  console.log("Data Food update", data);
  const requestOptions = formDataRequestOptions("PATCH", formData);

  try {
    const res = await fetch(`${apiUrl}/updatefood/${data.ID}`, requestOptions);
    if (res.status === 200) {
      return await res.json();
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error updating food:", error);
    return false;
  }
}

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

export async function GetCatagoryFoods() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/getcatagoryfood`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

export async function GetContainerFoods() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/getallcontainer`, requestOptions).then((res) => {
    if (res.status === 200) {
      return res.json();
    } else {
      return false;
    }
  });

  return res;
}

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



// ฟังก์ชันลบ StockOfFood
export const DeleteFoodByID = async (
  id: number | undefined
): Promise<boolean> => {
  try {
    const response = await fetch(
      `${apiUrl}/deletefood/${id}`,
      deleteRequestOptions()
    );

    if (response.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("ข้อผิดพลาดในการลบอาหาร:", error);
    return false;
  }
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

export async function getAllContainers(): Promise<any[]> {
  try {
    const response = await axios.get(`${apiUrl}/getallcontainer`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // ส่งข้อมูล Container ทั้งหมด
  } catch (error) {
    console.error("Error fetching containers:", error);
    throw new Error("Unable to fetch containers.");
  }
}

// ฟังก์ชันดึงข้อมูล Category ของอาหารทั้งหมด
export async function getAllCatagoriesOfFood(): Promise<any[]> {
  try {
    const response = await axios.get(`${apiUrl}/getcatagoryfood`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data; // ส่งข้อมูล Category ของอาหารทั้งหมด
  } catch (error) {
    console.error("Error fetching food categories:", error);
    throw new Error("Unable to fetch food categories.");
  }
}