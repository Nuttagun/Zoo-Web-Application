const apiUrl = "http://localhost:8000";


function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");
    return {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    };
}

async function getAllProductStock() {
    const requestOptions = {
        method: "GET",
        headers: getAuthHeaders(),
    };

    let res = await fetch(`${apiUrl}/getallproductstock`, requestOptions) 
        .then((res) => {
        if (res.status == 200) {
            return res.json();
        } else {
            return false;
        }
        });
    return res;
}

async function GetDataEmployeeByID(userid: string | null) {
    const requestOptions = {
      method: "GET",
      headers: getAuthHeaders(),
    };
  
    //console.log("requestOptions", requestOptions);
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

async function SearchProductReceive(Product: any) {
    const requestOptions = {
      method: "GET",
      headers: getAuthHeaders(),
    };
  
    let response = await fetch(`${apiUrl}/searchproductreceive?barcodeproduct=${Product}`, requestOptions) 
    const result = await response.json();
    return { response, result };
}

async function GetAllBarcodeProduct() {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let response = await fetch(`${apiUrl}/getallbarcodeproduct`, requestOptions) 
  const result = await response.json();//ตัวอ่าน  ข้อความ หรือ Error จาก backend
  return { response, result };
}


async function AddReceiveProduct(formData: FormData) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `${tokenType} ${token}`,
    },
    body: formData,
  };
  
  const response = await fetch(`${apiUrl}/addreceiveproduct`, requestOptions);
  const result = await response.json();
  return {result, response};
  
}
  
  
async function GetProductForOrganize() {
  const requestOptions = {
      method: "GET",
      headers: getAuthHeaders(),
  };

  //console.log("requestOptions", requestOptions);
  let res = await fetch(`${apiUrl}/getproductfororganize`, requestOptions) 
      .then((res) => {
      if (res.status == 200) {
          return res.json();
      } else {
          return false;
      }
      });
  return res;
}
  
async function GetAllShelfZone() {

  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let res = await fetch(`${apiUrl}/getalldatashelf`, requestOptions) 
  const result = await res.json();
  return result;
}

async function AddProductToShelfZone(data: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
      method: "POST",
      headers: {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // ต้องเป็น JSON string
  };

  let response = await fetch(`${apiUrl}/addproducttoshelfzone`, requestOptions); 
  const result = await response.json();
  return { response, result };
}


async function SearchProductSale(barcode: any) {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let response = await fetch(`${apiUrl}/searchproductsale?barcodeproduct=${barcode}`, requestOptions) 
  const result = await response.json();
  return { response, result };
}


async function AddSaleProduct(DataSaleProduct: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(DataSaleProduct),
  };

  const response = await fetch(`${apiUrl}/addsaleproduct`, requestOptions);
  const result = await response.json();//ตัวอ่าน  ข้อความ หรือ Error จาก backend
  return { response, result };
}


async function AddShelfZoneData(DataShelfZone: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(DataShelfZone),
  };

  const response = await fetch(`${apiUrl}/adddatashelfzone`, requestOptions);
  const result = await response.json();//ตัวอ่าน  ข้อความ หรือ Error จาก backend

  // if (response.ok) {
  //   console.log("AddShelfZoneData:", response);
  // console.log("Message from Backend:", result.error);
  // } else {
  //   console.log("AddShelfZoneData:", response);
  //   console.log("Error from Backend:", result.error);
  // }

  return { response, result };
}


async function getAllDataShelf() {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let response = await fetch(`${apiUrl}/getalldatashelf`, requestOptions) 
  const result = await response.json();//ตัวอ่าน  ข้อความ หรือ Error จาก backend
  // result อ่านได้ทั้ง (ข้อมูล data array ต่างๆ) (ข้อความ) ที่ส่งมาจาก Backend 
  // response   อ่านข้อสถานะการตอบกลับ 200 400

  // if (response.ok) {
  //   // console.log("getAllDataShelf:", result); //อ่านข้อมูลที่ส่งกลับมา
  //   console.log("Message from Backend:", result.message);
  // } else {
  //   console.log("getAllDataShelf:", response);
  //   console.log("Error from Backend:", result.error);
  // }
  return { response, result };   //อ่านข้อมูลที่ส่งกลับมาใช้  result ที่ได้จากการแปลงการตอบกลับ response เป็น Json
                    // อ่านข้อสถานะการตอบกลับ 200 400 ใช้ response 
}                    //result.message อ่านข้อความ หรือ Error ที่ส่งกลับมา 


async function ConfirmDeleteUpdateShelf(datashelf: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datashelf),
  };
  
  let response = await fetch(`${apiUrl}/deleteupdateshelf`, requestOptions) 
  const result = await response.json();
  return { response, result };
}



async function DeleteProductByID(productid: any) {
  const requestOptions: RequestInit = {
    method: "POST",
    headers: getAuthHeaders(),
  };
  
  let response = await fetch(`${apiUrl}/deleteproductbyid/${productid}`, requestOptions) 
  const result = await response.json();
  return { response, result };
}

async function AddEditProduct(formData: FormData) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `${tokenType} ${token}`,
    },
    body: formData,
  };
  
  const response = await fetch(`${apiUrl}/addeditproduct`, requestOptions);
  const result = await response.json();
  return {response, result };
  
}

async function MoveProductShelfZone(data: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `${tokenType} ${token}`,
    },
    body: JSON.stringify(data),
  };
  
  const response = await fetch(`${apiUrl}/moveproductshelfzone`, requestOptions);
  const result = await response.json();
  return {result, response};
  
}


async function GetProductForDisposal() {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let response = await fetch(`${apiUrl}/getproductfordisposal`, requestOptions) 
  const result = await response.json();
  return { response, result };

}      


async function AddDisposal(data: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `${tokenType} ${token}`,
    },
    body: JSON.stringify(data),
  };
  
  const response = await fetch(`${apiUrl}/adddisposal`, requestOptions);
  const result = await response.json();
  return {result, response};
  
}

export {
    getAllProductStock,
    GetDataEmployeeByID,
    SearchProductReceive,
    AddReceiveProduct,
    GetAllBarcodeProduct,
    GetProductForOrganize,
    GetAllShelfZone,
    AddProductToShelfZone,
    SearchProductSale,
    AddSaleProduct,
    AddShelfZoneData,
    getAllDataShelf,
    ConfirmDeleteUpdateShelf,
    DeleteProductByID,
    AddEditProduct,
    MoveProductShelfZone,

    GetProductForDisposal,
    AddDisposal

};