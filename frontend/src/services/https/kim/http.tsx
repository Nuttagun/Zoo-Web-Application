import axios from "axios";
import { Vetdashboardinterface } from "../../../interface/VetDashboard";

const apiUrl = "http://localhost:8000";


export async function getAllAnimals() { 
  try {
      const response = await axios.get(`${apiUrl}/animals`, {
          headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
          },
      });

      console.log(response.data);

return response.data as Vetdashboardinterface[]; 
  } catch (error) {
      console.error("Error fetching animals: ", error);
      throw new Error("เกิดข้อผิดพลาดในการดึงข้อมูลสัตว์");
  }
}



export async function GetHealths() {
  const requestOptions = getRequestOptions();

  let res = await fetch(`${apiUrl}/healths`, requestOptions).then((res) => {
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




  