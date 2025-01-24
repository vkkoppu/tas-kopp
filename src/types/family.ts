export interface FamilyMember {
  id: string;
  name: string;
  role: string;
}

export interface FamilyData {
  familyName: string;
  members: FamilyMember[];
}