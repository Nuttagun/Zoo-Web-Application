import { SexsInterface } from "./ISex";
import { BehavioralInterface } from "./IBehavioral";
import { BiologicalInterface } from "./IBiological";
import { HabitatInterface } from "./IHabitat";
import { EmployeeInterface } from "./IEmployee";

// Interface สำหรับ Medicine
export interface Medicine {
  ID: number;
  MedicineName: string;
  Dosage: string;
  Stock: number;
  ExpiryDate: string;
  Price: number;
  MedicineTypeID: number;
  MedicineType?: MedicineType;
}
export interface MedicineType{
  ID: number;
  MedicineType: string
}

export interface CreateMedicineInterface {
  MedicineName: string;
  Dosage: string;
  Price: number;
  Stock: number;
  MedicineTypeID: number;
  ExpiryDate: string;
}

export interface CreateMedicineType{
  MedicineType: string
}

// Interface สำหรับ Prescription
export interface Prescription {
  ID: number;
  Frequency: string;
  Duration: string;
  StartDate: string; 
  EndDate: string;
  Note: string;
  MedicineID?: number; // กรณีเก็บยา 1 ตัว (ไม่บังคับ)
  Medicines: Medicine[]; // เก็บหลาย IDs
  EmployeeID: number;
}

export interface PrescriptionSend {
  // ID: number;
  Frequency: string;
  Duration: string;
  StartDate: string; 
  EndDate: string;
  // PrescriptionGiveDate: string;
  Note: string;
  MedicineID?: number; // กรณีเก็บยา 1 ตัว (ไม่บังคับ)
  Medicines: number[]; // เก็บหลาย IDs
  // EmployeeID: number;
}
// Interface สำหรับ Treatment
export interface Treatment {
  ID: number;
  TreatmentPlan: string;
}

export interface TreatmentSend {
  // ID: number;
  TreatmentPlan: string;
}

// Interface สำหรับ MedicalRecord
export interface MedicalRecord {
  ID: number;
  DiagnosisDate: string;
  Diagnosis: string;
  Symptoms: string;
  TotalCost: number;
  EmployeeID: number;
  Employee?: EmployeeInterface;
  ReportID: number;
  TreatmentID: number;
  PrescriptionID: number | null;
  Prescription?: Prescription;
  Treatment?: Treatment;
  Medicines?: Medicine[]; // เชื่อมโยงยาใน Medical Record
}

// Interface สำหรับ Report
export interface ReportInterface {
  ID?: number;
  Title?: string;
  Description?: string;
  ReportDate?: string;
  StatusVet?: string;
  Picture?: string;
  AnimalID?: AnimalsInterface; // เชื่อมโยงกับ AnimalsInterface
  EmployeeID?: number; // เชื่อมโยงกับ EmployeeInterface
  Employee?:EmployeeInterface;
  MedicalRecords?: MedicalRecord; // เชื่อมโยง MedicalRecord ที่เกี่ยวข้อง
}

// Interface สำหรับ Animal
export interface AnimalsInterface {
  ID?: number;
  Name?: string;
  Weight?: number;
  Height?: number;
  Birthplace?: string;
  Description?: string;
  BirthDay?: string;
  Picture?: string;
  Health?: string;
  Note?: string;
  Sex?: SexsInterface;
  Behavioral?: BehavioralInterface;
  Biological?: BiologicalInterface;
  Habitat?: HabitatInterface;
  Employee?: EmployeeInterface;
  reports?: ReportInterface[]; // เชื่อมโยงกับรายงานทั้งหมดที่มี
}

export interface MedicalRecordHistory {
  Symptoms: string;
  Medicalrecord: {
    Diagnosis: string;
    Prescription: string;
    Treatment: {
      TreatmentPlan: string;
    };
    StartDate: string;
    EndDate: string;
    Frequency: string;
    Note: string;
    TotalCost: number;
  };
  Title: string;
  Picture: string;
  ReportDate: string;
}

export interface UpdateMedicalRecordRequest {
  diagnosis_date: string;
  diagnosis: string;
  symptoms: string;
  total_cost: number;
  treatment_plan: string;
}

