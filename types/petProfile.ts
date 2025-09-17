export interface PetProfile {
    id?: string;
    name: string; 
    photo?: string; 
    gender?: string; 
    age?: number; 
    birthDate?: string; 
    breed?: string; 
    adoptionDate?: string; 
    birthdayNotes?: string; 
    healthInfo?: {
        allergies?: string[]; 
        conditions?: string[]; 
        weightHistory: Array<{
            date: string; 
            weight: number; 
        }>;
    };
    vetVisits?: Array<{
        date: string; 
        reason: string; 
        notes?: string;
        clinicInfo?: {
            clinicName: string;
            address?: string; 
            phone?: string;
            doctorName?: string; 
        };
    }>;
    trainingLog?: Array<{
        task: string;
        date: string;
        progress: number;
        notes?: string; 
    }>;
    reminders?: Array<{
        type: "Vaccination" | "Food" | "Medicine" | "Event"; 
        date: string; 
        description: string;
        repeat?: "Daily" | "Weekly" | "Monthly" | "Yearly"; 
    }>;
}