const apiUrl = "http://localhost:8000";

function getAuthHeaders() {
    const token = localStorage.getItem("token");
    const tokenType = localStorage.getItem("token_type");
    return {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    };
}

async function GetDataBookingByID(bookingId: number | null) {
    const requestOptions = {
      method: "GET",
      headers: getAuthHeaders(),
    };

    let response = await fetch(`${apiUrl}/getdatabookingbyid/${bookingId}`, requestOptions) 
    const result = await response.json();
    return { response, result };
}

async function GetDataVehicleByBookingID(bookingId: number) {
  const requestOptions = {
    method: "GET",
    headers: getAuthHeaders(),
  };

  let response = await fetch(`${apiUrl}/getdatavehiclebybookingid/${bookingId}`, requestOptions) 
  const result = await response.json();
  return { response, result };
}

async function GetDataPromotionCanUse(data: any) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `${tokenType} ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const response = await fetch(`${apiUrl}/getdatapromotioncanuse`, requestOptions);
  const result = await response.json();
  return { response, result };
}



async function AddPaymentTicket(formData: FormData) {
  const token = localStorage.getItem("token");
  const tokenType = localStorage.getItem("token_type");

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { 
      "Authorization": `${tokenType} ${token}`,
    },
    body: formData,
  };
  
  const response = await fetch(`${apiUrl}/addpaymenticket`, requestOptions);
  const result = await response.json(); 

  return {response,result};
}

async function GetPayments() {
  const requestOptions = {
    method: "GET", // ใช้ GET method สำหรับดึงข้อมูล
    headers: getAuthHeaders(), // ใช้ headers สำหรับ Authorization
  };

    const response = await fetch(`${apiUrl}/getpayments`, requestOptions); // ส่ง request ไปที่ API ที่ต้องการ
    const result = await response.json(); // แปลง response เป็น JSON
    return { response, result }; // คืนค่าผลลัพธ์และ response

}

async function UpdatePaymentStatus(id: number, status: boolean): Promise<boolean> {
  const requestOptions = {
    method: "PATCH", // ใช้ PATCH method สำหรับอัปเดตข้อมูล
    headers: getAuthHeaders(),
    body: JSON.stringify({ PaymentStatus: status }), // ส่งค่า PaymentStatus ที่เป็น boolean
  };

  const response = await fetch(`http://localhost:8000/updatepayment/${id}`, requestOptions);
  const result = await response.json(); // แปลง response เป็น JSON
  if (response.ok) {
    return true; // อัปเดตสำเร็จ
  } else {
    console.error('Error updating payment status:', result); // แสดงผลลัพธ์ข้อผิดพลาด
    return false; // อัปเดตไม่สำเร็จ
  }
  
}




export {
  GetDataBookingByID,
  GetDataPromotionCanUse,
  AddPaymentTicket,
  GetPayments,
  GetDataVehicleByBookingID,
  UpdatePaymentStatus
};