/**
 * Property management process stages configuration
 *
 * Three main categories with subprocesses:
 * - Oportunidad: Initial property onboarding
 * - Búsqueda: Active marketing phase
 * - Cierre: Deal closing phase
 */

export type StageStatus = "accomplished" | "ongoing" | "future";

export interface SubStage {
  id: string;
  label: string;
  status: StageStatus;
}

export interface ProcessStage {
  id: string;
  label: string;
  status: StageStatus;
  subStages: SubStage[];
}

// Helper function to validate and fix substage progression within a stage
function validateSubstageProgression(subStages: SubStage[]): SubStage[] {
  let foundCompleted = false;

  return subStages.map((substage, _index) => {
    // If we found a completed substage, all previous ones should be completed
    if (substage.status === "accomplished") {
      foundCompleted = true;
    }

    // If we found a completed substage, all subsequent ones should be future
    if (foundCompleted && substage.status !== "accomplished") {
      return { ...substage, status: "future" as StageStatus };
    }

    return substage;
  });
}

// Helper function to validate global progression across all stages
function validateGlobalProgression(stages: ProcessStage[]): ProcessStage[] {
  // Find the last stage with any completed substage
  let lastCompletedStageIndex = -1;
  
  stages.forEach((stage, index) => {
    const hasCompletedSubstage = stage.subStages.some(
      sub => sub.status === "accomplished" || sub.status === "ongoing"
    );
    if (hasCompletedSubstage) {
      lastCompletedStageIndex = index;
    }
  });
  
  // If no completed stages found, return as is
  if (lastCompletedStageIndex === -1) {
    return stages;
  }
  
  // Apply logic: all stages before lastCompletedStageIndex should be completed
  // all stages after should be future
  return stages.map((stage, stageIndex) => {
    if (stageIndex < lastCompletedStageIndex) {
      // All previous stages: mark all substages as accomplished
      return {
        ...stage,
        subStages: stage.subStages.map(sub => ({ ...sub, status: "accomplished" as StageStatus }))
      };
    } else if (stageIndex > lastCompletedStageIndex) {
      // All future stages: mark all substages as future
      return {
        ...stage,
        subStages: stage.subStages.map(sub => ({ ...sub, status: "future" as StageStatus }))
      };
    }
    // Current stage: keep as is
    return stage;
  });
}

const rawProcessStages: ProcessStage[] = [
  {
    id: "oportunidad",
    label: "Oportunidad",
    status: "accomplished",
    subStages: [
      { id: "completar-info", label: "Datos pendientes", status: "accomplished" },
      { id: "firma-encargo", label: "Firma encargo", status: "future" },
    ],
  },
  {
    id: "busqueda",
    label: "Búsqueda",
    status: "ongoing",
    subStages: [
      { id: "visitas", label: "En visitas", status: "accomplished" },
    ],
  },
  {
    id: "cierre",
    label: "Cierre",
    status: "future",
    subStages: [
      { id: "contrato", label: "Contrato", status: "future" },
      { id: "arras", label: "Pago y firma", status: "future" },
      { id: "cerrado", label: "Cerrado", status: "future" },
    ],
  },
];

// Apply validation: first individual substage progression, then global progression
export const PROCESS_STAGES: ProcessStage[] = validateGlobalProgression(
  rawProcessStages.map(stage => ({
    ...stage,
    subStages: validateSubstageProgression(stage.subStages)
  }))
);

/**
 * Get stage styles based on status - Card-based design with elevation
 */
export const getStageStyles = (status: StageStatus) => {
  switch (status) {
    case "accomplished":
      return {
        card: "bg-white shadow-lg",
        badge: "bg-slate-600 text-slate-200 shadow-md font-bold",
        title: "text-slate-700",
        substage: "bg-slate-100 text-slate-600 shadow-sm",
        connector: "text-slate-400 drop-shadow-sm",
        arrow: "text-slate-500",
      };
    case "ongoing":
      return {
        card: "bg-white shadow-lg",
        badge: "bg-slate-600 text-slate-200 shadow-md font-bold",
        title: "text-slate-700",
        substage: "bg-slate-100 text-slate-600 shadow-sm",
        connector: "text-slate-400 drop-shadow-sm",
        arrow: "text-slate-500",
      };
    case "future":
      return {
        card: "bg-white/30 shadow-sm backdrop-blur-sm",
        badge: "bg-gray-200/50 text-gray-400 shadow-sm",
        title: "text-gray-400",
        substage: "bg-gray-100/40 text-gray-400 shadow-sm",
        connector: "text-gray-400 drop-shadow-sm",
        arrow: "text-gray-500/50",
      };
  }
};
