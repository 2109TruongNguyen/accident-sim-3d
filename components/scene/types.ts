export interface Entity {
  id: string;
  label?: string;
  type?: string;
  category?: 'vehicle' | 'road' | 'prop'; // To distinguish entity categories
  isStatic?: boolean; // If true, the entity uses a fixed physics body and might snap to grid
  licensePlate?: string;
  color: string;
  mass: number;
  speedKmh?: number;
  initialPosition: number[];
  initialVelocity: number[];
  modelPath?: string;
  modelRotationOffset?: number[]; // Used as world yaw / travel direction
  visualRotationOffset?: number[]; // Used purely to fix models exported backwards
}

export interface VehicleProps {
  entity: Entity;
  isPlaying: boolean;
  resetTrigger: number;
}

export interface DamageItem {
  category: string;
  amount: number;
  legalBasis: string;
}

export interface FaultEntry {
  id: string;
  label: string;
  percentage: number;
  reason: string;
}

export interface Damages {
  totalDamage: number;
  items: DamageItem[];
  faultRatio: {
    entityA: FaultEntry;
    entityB: FaultEntry;
  };
  actualCompensation: number;
  compensationNote: string;
}

export interface CaseInfo {
  caseNumber: string;
  title: string;
  date: string;
  time: string;
  location: string;
  area: string;
  damages: Damages;
}

export interface SceneEnvironment {
  type: string;
  timeOfDay: string;
  weather: string;
  roadNames: string[];
}

export interface SceneData {
  caseInfo: CaseInfo;
  environment: SceneEnvironment;
  entities: Entity[];
}
