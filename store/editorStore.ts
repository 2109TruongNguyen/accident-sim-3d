import { create } from 'zustand';
import { Entity, SceneData } from '@/components/scene/types';
import mockData from '../public/data/mock.json';

export interface EditorState {
  sceneData: SceneData;
  selectedEntityId: string | null;
  orbitEnabled: boolean;
  transformMode: 'translate' | 'rotate';

  // Actions
  setSceneData: (data: SceneData) => void;
  updateEnvironment: (env: Partial<SceneData['environment']>) => void;
  updateCaseInfo: (info: Partial<SceneData['caseInfo']>) => void;
  addEntity: (entity: Partial<Entity>) => void;
  removeEntity: (id: string) => void;
  updateEntityTransform: (id: string, position: number[], rotationOffset?: number[]) => void;
  updateEntityProps: (id: string, props: Partial<Entity>) => void;
  setSelectedEntityId: (id: string | null) => void;
  setOrbitEnabled: (enabled: boolean) => void;
  setTransformMode: (mode: 'translate' | 'rotate') => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useEditorStore = create<EditorState>((set) => ({
  sceneData: JSON.parse(JSON.stringify(mockData)), // Deep copy initial mock
  selectedEntityId: null,
  orbitEnabled: true,
  transformMode: 'translate',

  setSceneData: (data) => set({ sceneData: data }),

  updateEnvironment: (env) =>
    set((state) => ({
      sceneData: {
        ...state.sceneData,
        environment: { ...state.sceneData.environment, ...env },
      },
    })),

  updateCaseInfo: (info) =>
    set((state) => ({
      sceneData: {
        ...state.sceneData,
        caseInfo: { ...(state.sceneData.caseInfo || {}), ...info } as SceneData['caseInfo'],
      },
    })),
  addEntity: (entityPartial) =>
    set((state) => {
      const isRoad = entityPartial.category === 'road';
      const isCar = entityPartial.type === 'car' || (!entityPartial.category && !entityPartial.type);
      
      const defaultY = isRoad ? 0 : 0.5;

      const newEntity: Entity = {
        id: `entity_${generateId()}`,
        label: entityPartial.label || (isRoad ? 'Đường' : (isCar ? 'Ô tô' : 'Thực thể')),
        type: entityPartial.type || (isRoad ? 'road' : 'car'),
        category: entityPartial.category || 'vehicle',
        isStatic: entityPartial.isStatic || false,
        color: entityPartial.color || (isCar ? '#2563eb' : '#ef4444'),
        mass: entityPartial.mass || (isCar ? 1500 : 150),
        speedKmh: entityPartial.speedKmh || 40,
        initialPosition: entityPartial.initialPosition || [0, defaultY, 0],
        initialVelocity: entityPartial.initialVelocity || [0, 0, 0],
        modelPath: entityPartial.modelPath || '/models/vehicle/sedan.glb',
        modelRotationOffset: entityPartial.modelRotationOffset || [0, 0, 0],
        ...entityPartial,
      };
      return {
        sceneData: {
          ...state.sceneData,
          entities: [...state.sceneData.entities, newEntity],
        },
        selectedEntityId: newEntity.id,
      };
    }),

  removeEntity: (id) =>
    set((state) => ({
      sceneData: {
        ...state.sceneData,
        entities: state.sceneData.entities.filter((e) => e.id !== id),
      },
      selectedEntityId: state.selectedEntityId === id ? null : state.selectedEntityId,
    })),

  updateEntityTransform: (id, position, rotationOffset) =>
    set((state) => ({
      sceneData: {
        ...state.sceneData,
        entities: state.sceneData.entities.map((e) =>
          e.id === id
            ? {
                ...e,
                initialPosition: position,
                ...(rotationOffset ? { modelRotationOffset: rotationOffset } : {}),
              }
            : e
        ),
      },
    })),

  updateEntityProps: (id, props) =>
    set((state) => ({
      sceneData: {
        ...state.sceneData,
        entities: state.sceneData.entities.map((e) =>
          e.id === id ? { ...e, ...props } : e
        ),
      },
    })),

  setSelectedEntityId: (id) => set({ selectedEntityId: id }),

  setOrbitEnabled: (enabled) => set({ orbitEnabled: enabled }),
  
  setTransformMode: (mode) => set({ transformMode: mode }),
}));
