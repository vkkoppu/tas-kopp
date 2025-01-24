export interface FamilyMember {
  id: string;
  name: string;
  role: string;
}

export interface FamilyData {
  id?: string;
  familyName: string;
  members: FamilyMember[];
}