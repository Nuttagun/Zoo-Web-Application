import axios from "axios";
import { MedicalRecord, Treatment, Medicine,AnimalsInterface } from "../../../interface/IMedicalrecord";
// กำหนด URL ของ API
const apiUrl = "http://localhost:8000";

// ดึงข้อมูล MedicalRecord
export const getMedicalRecords = async () => {
  try {
    // ส่ง HTTP GET Request เพื่อดึงข้อมูลเวชระเบียน
    const response = await axios.get(`${apiUrl}/getallmedicalrecord`, {
      headers: {
        // เพิ่ม JWT Token เพื่อยืนยันสิทธิ์การเข้าถึง
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        // ระบุว่าข้อมูลที่ส่งหรือรับเป็น JSON
        "Content-Type": "application/json",
      },
    });

    // คืนค่าข้อมูลเวชระเบียน (ในรูปแบบ TypeScript Interface)
    return response.data.data as MedicalRecord[];
  } catch (error) {
    // แสดงข้อผิดพลาดในกรณีดึงข้อมูลไม่สำเร็จ
    console.error("Error fetching medical records:", error);

    // โยนข้อผิดพลาดเพื่อแจ้งเตือนไปยังผู้เรียกใช้ฟังก์ชัน
    throw new Error("Failed to fetch medical records");
  }
};




export const createMedicalRecordFromReport = async (reportId: string, medicalRecordData: any) => {
  try {
    const reportIdFormatted = Number(reportId);
    if (isNaN(reportIdFormatted)) {
      throw new Error("Invalid report ID format");
    }

    // เตรียมข้อมูลที่ต้องการส่ง
    const data: any = {
      ReportID: reportIdFormatted,
      MedicalRecord: {
        DiagnosisDate: medicalRecordData.MedicalRecord.DiagnosisDate,
        Diagnosis: medicalRecordData.MedicalRecord.Diagnosis,
        Symptoms: medicalRecordData.MedicalRecord.Symptoms,
        TotalCost: medicalRecordData.MedicalRecord.TotalCost,
        EmployeeID: medicalRecordData.MedicalRecord.EmployeeID,
        ReportID: reportIdFormatted,
        TreatmentID: medicalRecordData.MedicalRecord.TreatmentID || null,
        PrescriptionID: medicalRecordData.MedicalRecord.PrescriptionID || null,
      },
    };

    // เพิ่มข้อมูล Treatment ถ้ามี
    if (medicalRecordData.Treatment && medicalRecordData.Treatment.TreatmentPlan) {
      data.Treatment = {
        TreatmentPlan: medicalRecordData.Treatment.TreatmentPlan,
      };
    }

    // เพิ่มข้อมูล Prescription ถ้ามี
    if (medicalRecordData.Prescription) {
      const prescriptionData: any = {
        Frequency: medicalRecordData.Prescription.Frequency,
        Duration: medicalRecordData.Prescription.Duration,
        StartDate: medicalRecordData.Prescription.StartDate,
        EndDate: medicalRecordData.Prescription.EndDate,
        Note: medicalRecordData.Prescription.Note,
        EmployeeID: medicalRecordData.MedicalRecord.EmployeeID,
      };

      if (Object.keys(prescriptionData).length > 0) {
        data.Prescription = prescriptionData;
      }
    }

    // เพิ่ม MedicineIDs ถ้ามี
    if (medicalRecordData.MedicineIDs && medicalRecordData.MedicineIDs.length > 0) {
      data.MedicineIDs = medicalRecordData.MedicineIDs;
    }

    // Debug: Log ข้อมูล request data
    console.log("Request Data:", JSON.stringify(data, null, 2));

    // เรียก API เพื่อสร้าง Medical Record
    const response = await axios.post(
      `${apiUrl}/reports/${reportIdFormatted}/medicalrecords`,
      data,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );

    // ตรวจสอบว่าได้รับ PrescriptionID จาก Response หรือไม่
    const prescriptionID = response.data.prescriptionID || null;
    if (prescriptionID) {
      medicalRecordData.MedicalRecord.PrescriptionID = prescriptionID;
    }

    return response.data;

  } catch (error: any) {
    console.error("Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Failed to create medical record");
  }
};



export const ListReports = async () => {
  try {
    const response = await axios.get(`${apiUrl}/reportsforvet`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`, // Use token for authentication
        "Content-Type": "application/json",
      },
    });
    return response.data; // Return the data of the reports
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw new Error("Failed to fetch reports");
  }
};


// ฟังก์ชันดึงข้อมูลยาจาก API
export const getMedicines = async (): Promise<Medicine[]> => {
  try {
    const response = await axios.get(`${apiUrl}/getallmedicine`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    // ส่งข้อมูล Medicine แบบเต็มจาก API
    return response.data;
  } catch (error) {
    console.error("Error fetching medicines:", error);
    throw new Error("Failed to fetch medicines");
  }
};



// ฟังก์ชันดึงข้อมูล Medicine ที่เชื่อมโยงกับ Prescription จาก API
export const getMedicinesByPrescriptionId = async (prescriptionId: number) => {
  try {
    // ส่ง HTTP GET Request เพื่อดึงข้อมูล Medicine ที่เชื่อมโยงกับ Prescription ID
    const response = await axios.get(`${apiUrl}/getallPrescriptionMedicine/${prescriptionId}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    // ตรวจสอบและแปลงข้อมูลจาก API ให้เป็นรูปแบบ TypeScript Interface
    return response.data.medicines as Medicine[];
  } catch (error) {
    // แสดงข้อผิดพลาดในกรณีดึงข้อมูลไม่สำเร็จ
    console.error(`Error fetching medicines for prescription ID ${prescriptionId}:`, error);

    // โยนข้อผิดพลาดเพื่อแจ้งเตือนไปยังผู้เรียกใช้ฟังก์ชัน
    throw new Error(`Failed to fetch medicines for prescription ID ${prescriptionId}`);
  }
};

export const getMedicalRecordByReportID = async (reportID: number): Promise<MedicalRecord[]> => {
  try {
    const response = await axios.get(`${apiUrl}/getmedicalbyreportid/${reportID}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as MedicalRecord[];
  } catch (error) {
    console.error("Error fetching medical record by report ID:", error);
    throw new Error("Failed to fetch medical record by report ID");
  }
};


// ฟังก์ชันบริการเพื่อดึงข้อมูลสัตว์ตาม ID
export const getAnimalDetails = async (animalId: number): Promise<AnimalsInterface | null> => {
  try {
    const response = await axios.get(`${apiUrl}/getanimaldetail/${animalId}`, {
      headers:{
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      const animalData: AnimalsInterface = response.data.animal;
      const reports = response.data.reports;

      const processedReports = reports.map((report: any) => {
        const medicalRecord = report.MedicalRecord ? {
          diagnosisDate: report.MedicalRecord.DiagnosisDate,
          diagnosis: report.MedicalRecord.Diagnosis,
          symptoms: report.MedicalRecord.Symptoms,
          totalCost: report.MedicalRecord.TotalCost,
          prescription: report.MedicalRecord.Prescription ? {
            frequency: report.MedicalRecord.Prescription.Frequency,
            duration: report.MedicalRecord.Prescription.Duration,
            startDate: report.MedicalRecord.Prescription.StartDate,
            endDate: report.MedicalRecord.Prescription.EndDate,
            prescriptionGiveDate: report.MedicalRecord.Prescription.PrescriptionGiveDate,
            note: report.MedicalRecord.Prescription.Note,
            medicines: report.MedicalRecord.Prescription.Medicines
          } : null
        } : null;

        return {
          ...report,
          medicalRecord
        };
      });

      return {
        ...animalData,
        reports: processedReports
      };
    } else {
      console.error('Error fetching animal details:', response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error fetching animal details:', error);
    return null;
  }
};


export const createMedicine = async (medicine: { MedicineName: string; Description: string }): Promise<{ label: string; value: string }> => {
  try {
    const response = await axios.post(`${apiUrl}/addmidicine`, medicine, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    // แปลงข้อมูลที่ได้จาก response ให้อยู่ในรูปแบบที่ต้องการ
    return {
      label: response.data.MedicineName,  // ชื่อยา
      value: String(response.data.ID),    // ใช้ ID เป็น value
    };
  } catch (error) {
    console.error("Error creating medicine:", error);
    throw new Error("Failed to create medicine");
  }
};


export const getMedicalHistoryByAnimalID = async (animalID: string) => {
  try {
    const response = await axios.get(`${apiUrl}/animals/${animalID}/medical-history`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data.data; // ส่งข้อมูลที่ได้จาก API
  } catch (error) {
    console.error("Error fetching medical history:", error);
    throw new Error("Failed to fetch medical history");
  }
};

export const getMedicalRecordById = async (id: number): Promise<MedicalRecord> => {
  try {
    const response = await axios.get(`${apiUrl}/getmedicinerecordbyid/${id}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    return response.data as MedicalRecord;
  } catch (error) {
    console.error("Error fetching medical record by ID:", error);
    throw new Error("Failed to fetch medical record");
  }
};


export const updateMedicalRecordAndTreatmentById = async (
  id: number,
  updatedData: {
    medicalRecord: Partial<MedicalRecord>;
    treatment: Partial<Treatment>;
  }
): Promise<void> => {
  try {
    await axios.put(
      `${apiUrl}/updatemedicalrecordandtreatment/${id}`,
      updatedData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating medical record and treatment:", error);
    throw new Error("Failed to update medical record and treatment");
  }
};



export const deleteMedicalRecordById = async (id: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/deletemedicalrecordbyid/${id}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  });
    return response.data;
  } catch (error) {
    console.error("Error deleting medical record:", error);
    throw error; // Forward error for further handling
  }
};

export const getReportsByAnimalID = async (animalID: number) => {
  try {
    const response = await axios.get(`${apiUrl}/getreportbyanimalid/${animalID}`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reports by animal ID:", error);
    throw new Error("Failed to fetch reports");
  }
}