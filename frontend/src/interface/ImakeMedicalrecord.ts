// Treatment Interface
export interface Treatmentforvet {
    ID: number
    TreatmentPlan: string;
  }
  
// ในไฟล์ IMedicalrecord.ts
export interface Prescription {
    ID: number;
    EmployeeID: number;
    Frequency: string;
    Duration: string;
    StartDate: string | null;  // ปรับให้รองรับ null
    EndDate: string | null;
    PrescriptionGiveDate: string | null;
    Note: string;
    Medicines: number[];
  }
  
  
  // MedicalRecord Interface
  export interface MedicalRecordRequest {
    DiagnosisDate: string | null;
    Diagnosis: string;
    Symptoms: string;
    RecordDate: string | null;
    TotalCost: number;
    EmployeeID: number;
    ReportID: number;
    TreatmentID: number | null; // If treatment was created, this will have an ID
    PrescriptionID: number | undefined; // If prescription was created, this will have an ID
  }
  
  // Medicine Interface (For the `getMedicines` function)
  export interface Medicine {
    label: string;
    value: string | number;
  }
  
  // Response Interfaces
  export interface CreateTreatmentResponse {
    id: number;
    TreatmentPlan: string;
  }
  
  export interface CreatePrescriptionResponse {
    id: number;
    Frequency: string;
    Duration: string;
    StartDate: string | null;
    EndDate: string | null;
    PrescriptionGiveDate: string | null;
    Note: string | null;
    Medicines: number[];
  }
  
  export interface CreateMedicalRecordResponse {
    id: number;
    DiagnosisDate: string | null;
    Diagnosis: string;
    Symptoms: string;
    RecordDate: string | null;
    TotalCost: number;
    EmployeeID: number;
    ReportID: number;
    TreatmentID: number | null;
    PrescriptionID: number | undefined;
  }
  
  export interface UpdateReportStatusResponse {
    status: string;
    message: string;
  }
  