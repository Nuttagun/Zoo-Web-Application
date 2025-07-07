import axios from "axios";
import { LoginInterface } from "../../interface/Login";

const apiUrl = "http://localhost:8000";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  return {
    "Authorization": `${tokenType} ${token}`,
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



async function GetDataEmployeeByID(userid: string | null) {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let res = await fetch(`${apiUrl}/getdataemployeebyid/${userid}`, requestOptions) 
    .then((res) => {
      if (res.status == 200) {
        return res.json();
      } else {
        return false;
      }
    });
  return res;
}

export {
  AddLogin,
  GetDataEmployeeByID,
};
