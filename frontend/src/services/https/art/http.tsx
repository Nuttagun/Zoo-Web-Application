
import { PromotionInterface } from "../../../interface/IPromotion";

const apiUrl = "http://localhost:8000";


// function getAuthHeaders() {
//     const token = localStorage.getItem("token");
//     const tokenType = localStorage.getItem("token_type");
//     return {
//       "Authorization": `${tokenType} ${token}`,
//       "Content-Type": "application/json",
//     };
// }
// @ts-ignore
function getAuthHeaders() {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");
  if (!token || !tokenType) {
      console.error("Token or token type is missing");
      return {};
  }
  return {
    "Authorization": `${tokenType} ${token}`,
    "Content-Type": "application/json",
  };
}


async function GetAllPromotion() {
    const requestOptions = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
};

    let res = await fetch(`${apiUrl}/promotions_list`, requestOptions) 
        .then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            return false;
        }
        });
    return res;
}

async function GetPromotionByID(userid: string | null) {
    const requestOptions = {
      method: "GET",
      // headers: getAuthHeaders(),
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    };
  
    let res = await fetch(`${apiUrl}/promotions_by_id/${userid}`, requestOptions) 
      .then((res) => {
        if (res.status == 200) {
          return res.json();
        } else {
          return false;
        }
      });
    return res;
}


async function CreatePromotion(data: PromotionInterface) {
  const requestOptions = {
    method: "POST",
    // headers: { "Content-Type": "application/json" },
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  try {
    console.log("Request Options:", requestOptions);
    const response = await fetch(`${apiUrl}/promotion_create`, requestOptions);
    console.log("Response Status:", response.status);

    const responseData = await response.json();
    console.log("Response Data:", responseData);

    return {
      status: response.ok,
      message: response.ok ? responseData.message : responseData.error,
    };
  } catch (error) {
    console.error("Error occurred:", error);
    return {
      status: false,
      message: "An error occurred",
    };
  }
}


// async function UpdatePromotion(id:Number|undefined) {
//   const requestOptions = {
//       method: "PATCH",
//       // headers:getAuthHeaders(),
//       headers: {
//         "Authorization": `Bearer ${localStorage.getItem("token")}`,
//         "Content-Type": "application/json",
//       },
//   };
//   let res = await fetch(`${apiUrl}/promotions_update/${id}`, requestOptions)
//     .then((response) => response.json())
//     .then((res) => {
//       if (res.data) {
//         return { status: true, message: res.data };
//       } else {
//         return { status: false, message: res.error };
//       }
//     });

//   return res;
// }

// async function UpdatePromotion(id: Number | undefined, values: any) {
//   const requestOptions = {
//     method: "PATCH",
//     headers: {
//       "Authorization": `Bearer ${localStorage.getItem("token")}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(values), // Pass the updated data here
//   };

//   let res = await fetch(`${apiUrl}/promotions_update/${id}`, requestOptions)
//     .then((response) => response.json())
//     .then((res) => {
//       if (res.data) {
//         return { status: true, message: res.data };
//       } else {
//         return { status: false, message: res.error };
//       }
//     });

//   return res;
// }

// async function UpdatePromotion(id: Number | undefined, values: any) {
//   const requestOptions = {
//     method: "PATCH",
//     headers: {
//       "Authorization": `Bearer ${localStorage.getItem("token")}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(values), // Pass the updated data here
//   };

//   try {
//     const response = await fetch(`${apiUrl}/promotions_update/${id}`, requestOptions);
//     const result = await response.json();

//     if (!response.ok) {
//       // Handle HTTP errors (e.g., 400, 401, 403)
//       throw new Error(result.error || "Failed to update promotion");
//     }

//     // Handle success case
//     return { status: true, message: result.data };
//   } catch (error: any) {
//     // Catch and log any errors
//     console.error("UpdatePromotion Error:", error.message);
//     return { status: false, message: error.message };
//   }
// }

async function UpdatePromotion(id: Number | undefined, values: any) {
  const token = localStorage.getItem("token");
  if (!token) {
    return { status: false, message: "Token is missing. Please log in." };
  }

  const requestOptions = {
    method: "PATCH",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  };

  try {
    console.log("Sending Data:", JSON.stringify(values, null, 2));

    const response = await fetch(`${apiUrl}/promotions_update/${id}`, requestOptions);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `HTTP error ${response.status}`);
    }

    return { status: true, message: result.data };
  } catch (error: any) {
    console.error("UpdatePromotion Error:", error.message);
    return { status: false, message: error.message };
  }
}


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

async function DeletePromotionByID(id: Number | undefined) {
  const requestOptions = deleteRequestOptions();

  let res = await fetch(`${apiUrl}/promotions_delete/${id}`, requestOptions)
    .then((res) => {
      if (res.status === 200) {
        return true;
      } else {
        return false;
      }
    });

  return res;
}

async function GetCondition() {
  const requestOptions = {
      method: "GET",
      // headers: getAuthHeaders(),
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
  };

  let res = await fetch(`${apiUrl}/promotions_condition_list`, requestOptions) 
      .then((res) => {
      if (res.status == 200) {
          return res.json();
      } else {
          return false;
      }
      });
  return res;
}

async function GetPromotionCategory() {
  const requestOptions = {
      method: "GET",
      // headers: getAuthHeaders(),
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
  };

  let res = await fetch(`${apiUrl}/promotions_category_list`, requestOptions) 
      .then((res) => {
      if (res.status == 200) {
          return res.json();
      } else {
          return false;
      }
      });
  return res;
}

async function GetPromotionStatus() {
  const requestOptions = {
      method: "GET",
      // headers: getAuthHeaders(),
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
  };

  let res = await fetch(`${apiUrl}/promotions_status_list`, requestOptions) 
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
    GetAllPromotion,
    CreatePromotion,
    UpdatePromotion,
    DeletePromotionByID,

    GetCondition,
    GetPromotionCategory,
    GetPromotionStatus,

    GetPromotionByID,

    // GetDataEmployeeByID,

};