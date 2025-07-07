// Interfaces.ts

export interface Treatment {
    treatmentPlan: string; // แผนการรักษา
  }
  
  export interface Prescription {
    frequency: string; // ความถี่ในการใช้ยา
    duration: string;  // ระยะเวลาในการใช้ยา
    startDate: string; // วันที่เริ่มใช้ยา
    endDate: string;   // วันที่สิ้นสุดการใช้ยา
    prescriptionGiveDate: string; // วันที่ได้รับการสั่งยา
    note: string;      // หมายเหตุ
  }
  
  export interface MedicalRecord {
    reportID: number;
    treatmentID: number;
    prescriptionID?: number | null; // ค่าของ PrescriptionID อาจเป็น 0 หรือ null
    diagnosis: string;
    symptoms: string;
    recordDate: string;
    totalCost: number;
  }
  
  export interface CreateTreatmentResponse {
    treatmentID: number; // รหัส Treatment ที่สร้างขึ้น
  }
  
  export interface CreatePrescriptionResponse {
    prescriptionID: number; // รหัส Prescription ที่สร้างขึ้น
  }
  
  export interface CreateMedicalRecordResponse {
    medicalRecordID: number; // รหัส MedicalRecord ที่สร้างขึ้น
  }
  
  export interface UpdateReportStatusResponse {
    status: string; // สถานะของการอัพเดต
  }
  