"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent as ReactChangeEvent, CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";
import {
  ArrowRight,
  AlertTriangle,
  Bot,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Download,
  GitBranch,
  Grip,
  LayoutTemplate,
  ListTree,
  LocateFixed,
  Maximize2,
  MousePointer2,
  Plus,
  Printer,
  Redo2,
  RefreshCw,
  Share2,
  Trash2,
  Undo2,
  Upload,
  Workflow,
  X,
} from "lucide-react";
import {
  commandIcons,
  demoBlueprint,
  getEdgeTypes,
  getNodeKinds,
  getStackPatterns,
  getWorkflowTemplates,
  stepItems,
  type ActiveView,
  type AlternativeKind,
  type BlueprintAlternative,
  type AutomationLevel,
  type BlueprintFile,
  type CanvasEdge,
  type CanvasNode,
  type Complexity,
  type EdgeType,
  type NodeKind,
  type Sensitivity,
  type StackPatternId,
  type TeamCapacity,
} from "@/lib/blueprint-data";
import {
  buildPromptPack,
  buildReport,
  applyBlueprintAlternative,
  clearWarningResolution,
  completionMessage,
  createBlueprintAlternative,
  createBlankBlueprint,
  formatPromptPackAsMarkdown,
  formatReportAsMarkdown,
  generateDraftWorkflow,
  getCompletionScore,
  getPatternById,
  readStoredBlueprintState,
  recommendStackPatterns,
  runHitmChecks,
  storageKey,
  updateGate,
  updateOwnership,
  updateWarningResolution,
  type HitmWarning,
  type PromptPackItem,
} from "@/lib/blueprint-engine";
import { defaultLocale, formatCalendarDate, isLocale, localeStorageKey, supportedLocales, t as translate, type Locale, type TranslationKey } from "@/lib/i18n";
import { parseBlueprintBackup } from "@/lib/blueprint-schema";
import { blueprintForOutput } from "@/lib/blueprint-localization";
import { AccessibleDialog, useDisclosure } from "@/components/accessible-overlays";
import { releaseVersion } from "@/lib/public-release";

const nodeSize = { width: 200, height: 170 };
const canvasWorld = { width: 7000, height: 5000 };
const initialViewport: CanvasViewport = { x: -2350, y: -1650, zoom: 1 };
const minZoom = 0.55;
const maxZoom = 1.8;
const inspectorMinWidth = 296;
const inspectorDefaultWidth = 352;
const inspectorMaximumWidth = 760;
const inspectorWidthStorageKey = "hitm-blueprint-inspector-width-v1";

type Translate = (key: TranslationKey, replacements?: Record<string, string | number>) => string;

const TranslationContext = createContext<{ locale: Locale; t: Translate }>({
  locale: defaultLocale,
  t: (key) => translate(defaultLocale, key),
});

function useStudioTranslation() {
  return useContext(TranslationContext);
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function projectFilenameStem(projectName: string) {
  const normalized = projectName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "untitled-blueprint";
}

function getEdgeGeometry(from: CanvasNode, to: CanvasNode) {
  const fromCenter = { x: from.x + nodeSize.width / 2, y: from.y + nodeSize.height / 2 };
  const toCenter = { x: to.x + nodeSize.width / 2, y: to.y + nodeSize.height / 2 };
  const horizontal = Math.abs(toCenter.x - fromCenter.x) > Math.abs(toCenter.y - fromCenter.y);

  if (horizontal) {
    const direction = toCenter.x >= fromCenter.x ? 1 : -1;
    const x1 = fromCenter.x + direction * (nodeSize.width / 2);
    const x2 = toCenter.x - direction * (nodeSize.width / 2);
    const control = Math.max(Math.abs(x2 - x1) * 0.5, 72);
    return {
      path: `M ${x1} ${fromCenter.y} C ${x1 + direction * control} ${fromCenter.y}, ${x2 - direction * control} ${toCenter.y}, ${x2} ${toCenter.y}`,
      labelX: (x1 + x2) / 2,
      labelY: (fromCenter.y + toCenter.y) / 2 - 8,
    };
  }

  const direction = toCenter.y >= fromCenter.y ? 1 : -1;
  const y1 = fromCenter.y + direction * (nodeSize.height / 2);
  const y2 = toCenter.y - direction * (nodeSize.height / 2);
  const control = Math.max(Math.abs(y2 - y1) * 0.5, 72);
  return {
    path: `M ${fromCenter.x} ${y1} C ${fromCenter.x} ${y1 + direction * control}, ${toCenter.x} ${y2 - direction * control}, ${toCenter.x} ${y2}`,
    labelX: (fromCenter.x + toCenter.x) / 2,
    labelY: (y1 + y2) / 2 - 8,
  };
}

type DragState = {
  nodeId: string;
  offsetX: number;
  offsetY: number;
  snapshot: CanvasSnapshot;
  didMove: boolean;
};

type CanvasSnapshot = Pick<BlueprintFile, "nodes" | "edges">;
type CanvasSelection = { type: "node" | "edge"; id: string } | null;
type WorkspacePanel = "intake" | "library" | "workflow";
type FlowStepId = (typeof stepItems)[number]["id"];
type ProjectResetTarget = "demo" | "blank";

type CanvasViewport = {
  x: number;
  y: number;
  zoom: number;
};

type PanState = {
  pointerId: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
};

type InspectorResizeState = {
  pointerId: number;
  startClientX: number;
  startWidth: number;
};

type FieldKey = keyof Pick<
  BlueprintFile,
  | "projectName"
  | "audience"
  | "projectGoal"
  | "aiAssistance"
  | "humanControl"
  | "sourceMaterial"
  | "successMeasures"
  | "scopeIn"
  | "scopeOut"
>;

export function BlueprintStudio() {
  const [blueprint, setBlueprint] = useState<BlueprintFile>(demoBlueprint);
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [localeReady, setLocaleReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const [importFailed, setImportFailed] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>("canvas");
  const [selection, setSelection] = useState<CanvasSelection>({ type: "node", id: "review-gate" });
  const [workspacePanel, setWorkspacePanel] = useState<WorkspacePanel>("intake");
  const [currentFlowStep, setCurrentFlowStep] = useState<FlowStepId>("context");
  const [governanceExpanded, setGovernanceExpanded] = useState(false);
  const [inspectorWidth, setInspectorWidth] = useState(inspectorDefaultWidth);
  const [inspectorPreferenceReady, setInspectorPreferenceReady] = useState(false);
  const [intakeCollapsed, setIntakeCollapsed] = useState(true);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<EdgeType>("sequence");
  const [canvasControlsOpen, setCanvasControlsOpen] = useState(false);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [pendingProjectReset, setPendingProjectReset] = useState<ProjectResetTarget | null>(null);
  const [dialogOpener, setDialogOpener] = useState<HTMLElement | null>(null);
  const moreDisclosure = useDisclosure(moreActionsOpen, setMoreActionsOpen);
  const templateDisclosure = useDisclosure(templateOpen, setTemplateOpen);
  const [adoptedAlternativeId, setAdoptedAlternativeId] = useState<string | null>(null);
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [panState, setPanState] = useState<PanState | null>(null);
  const [viewport, setViewport] = useState<CanvasViewport>(initialViewport);
  const canvasRef = useRef<HTMLDivElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const inspectorResize = useRef<InspectorResizeState | null>(null);
  const suppressNodeClick = useRef(false);
  const undoStack = useRef<CanvasSnapshot[]>([]);
  const redoStack = useRef<CanvasSnapshot[]>([]);
  const t: Translate = (key, replacements) => translate(locale, key, replacements);
  const localizedNodeKinds = getNodeKinds(locale);
  const localizedEdgeTypes = getEdgeTypes(locale);
  const localizedWorkflowTemplates = getWorkflowTemplates(locale);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedLocale = window.localStorage.getItem(localeStorageKey);
        if (isLocale(storedLocale)) setLocale(storedLocale);
      } catch {}
      setLocaleReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!localeReady) return;
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(localeStorageKey, locale);
    } catch {}
  }, [locale, localeReady]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const stored = readStoredBlueprintState();
      setBlueprint(stored.blueprint);
      setStorageBlocked(stored.failed);
      setStorageReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!storageReady || storageBlocked) return;
    let failed = false;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(blueprint));
    } catch { failed = true; }
    const frame = window.requestAnimationFrame(() => setSaveFailed(failed));
    return () => window.cancelAnimationFrame(frame);
  }, [blueprint, storageReady, storageBlocked]);

  const completion = getCompletionScore(blueprint);
  const recommendedPatternIds = useMemo(() => recommendStackPatterns(blueprint), [blueprint]);
  const selectedPattern = getPatternById(blueprint.selectedPattern, locale);
  const warnings = useMemo(() => runHitmChecks(blueprint, locale), [blueprint, locale]);
  const prompts = useMemo(() => buildPromptPack(blueprint, locale), [blueprint, locale]);
  const report = useMemo(() => buildReport(blueprint, locale), [blueprint, locale]);
  const reportMarkdown = useMemo(() => formatReportAsMarkdown(blueprint, report), [blueprint, report]);
  const selectedNode =
    selection?.type === "node" ? blueprint.nodes.find((node) => node.id === selection.id) : undefined;
  const selectedEdge =
    selection?.type === "edge" ? blueprint.edges.find((edge) => edge.id === selection.id) : undefined;
  const { canUndo, canRedo } = historyState;
  const openWarningCount = warnings.filter((warning) => warning.status === "open").length;
  const selectedSummary = selectedNode
    ? t("selected", { value: selectedNode.title })
    : selectedEdge
      ? t("selected", { value: selectedEdge.label || localizedEdgeTypes.find((edge) => edge.id === selectedEdge.type)?.label || t("connectionType") })
      : t("nothingSelected");
  const continueLabel =
    blueprint.nodes.length === 0
      ? t("generateWorkflow")
      : currentFlowStep === "context"
        ? t("mapWorkflow")
        : currentFlowStep === "workflow"
          ? t("assignOwnership")
          : currentFlowStep === "ownership"
            ? t("setGovernance")
            : currentFlowStep === "governance"
              ? t("validateChecks")
              : currentFlowStep === "stress"
                ? openWarningCount > 0
                  ? t("resolveChecks")
                  : t("openPromptPack")
                : activeView === "report"
                  ? t("printReport")
                  : t("openReport");
  const activeStepIndex = stepItems.findIndex((step) => step.id === currentFlowStep);
  const localizedStepItems = stepItems.map((step) => {
    const labels: Record<FlowStepId, [TranslationKey, TranslationKey]> = {
      context: ["defineContext", "projectAndPeople"],
      workflow: ["mapWorkflow", "canvasSteps"],
      ownership: ["assignOwnership", "humansAndAi"],
      governance: ["setGovernance", "gatesAndPolicies"],
      stress: ["validateStress", "risksAndReview"],
      export: ["documentExport", "reportHandoff"],
    };
    const [label, detail] = labels[step.id];
    return { ...step, label: t(label), detail: t(detail) };
  });

  function goToStep(stepId: FlowStepId) {
    setCurrentFlowStep(stepId);
    if (stepId === "context") {
      setWorkspacePanel("intake");
      setActiveView("canvas");
      setIntakeCollapsed(false);
      setGovernanceExpanded(false);
      return;
    }

    setIntakeCollapsed(true);

    if (stepId === "workflow") {
      setWorkspacePanel("workflow");
      setActiveView("canvas");
      setGovernanceExpanded(false);
      window.requestAnimationFrame(fitCanvas);
      return;
    }

    if (stepId === "ownership") {
      setActiveView("matrix");
      setGovernanceExpanded(false);
      return;
    }

    if (stepId === "governance") {
      setWorkspacePanel("workflow");
      setActiveView("canvas");
      setGovernanceExpanded(true);
      setSelection((current) => current ?? (blueprint.nodes[0] ? { type: "node", id: blueprint.nodes[0].id } : null));
      return;
    }

    if (stepId === "stress") {
      setActiveView("checks");
      setGovernanceExpanded(false);
      return;
    }

    if (stepId === "export") {
      setActiveView("prompts");
      setGovernanceExpanded(false);
    }
  }

  function openInspectorView(view: ActiveView) {
    setActiveView(view);
    if (view === "canvas") {
      setCurrentFlowStep("workflow");
      setGovernanceExpanded(false);
    } else if (view === "matrix") {
      setCurrentFlowStep("ownership");
      setGovernanceExpanded(false);
    } else if (view === "checks") {
      setCurrentFlowStep("stress");
      setGovernanceExpanded(false);
    } else if (view === "alternatives") {
      setCurrentFlowStep("workflow");
      setGovernanceExpanded(false);
    } else {
      setCurrentFlowStep("export");
      setGovernanceExpanded(false);
    }
  }

  function maximumInspectorWidth() {
    return Math.min(inspectorMaximumWidth, Math.max(inspectorMinWidth, window.innerWidth - 660));
  }

  function setInspectorWidthWithinBounds(width: number) {
    setInspectorWidth(Math.round(Math.min(maximumInspectorWidth(), Math.max(inspectorMinWidth, width))));
  }

  function beginInspectorResize(event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    inspectorResize.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startWidth: inspectorWidth,
    };
  }

  function moveInspectorResize(event: ReactPointerEvent<HTMLButtonElement>) {
    const resize = inspectorResize.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    setInspectorWidthWithinBounds(resize.startWidth + (resize.startClientX - event.clientX));
  }

  function endInspectorResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (inspectorResize.current?.pointerId !== event.pointerId) return;
    inspectorResize.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleInspectorResizeKey(event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    if (event.key === "Home") setInspectorWidthWithinBounds(inspectorMinWidth);
    else if (event.key === "End") setInspectorWidthWithinBounds(maximumInspectorWidth());
    else setInspectorWidthWithinBounds(inspectorWidth + (event.key === "ArrowLeft" ? 24 : -24));
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const storedWidth = Number(window.localStorage.getItem(inspectorWidthStorageKey));
        if (Number.isFinite(storedWidth) && storedWidth >= inspectorMinWidth) {
          setInspectorWidth(Math.min(maximumInspectorWidth(), Math.round(storedWidth)));
        }
      } catch {}
      setInspectorPreferenceReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!inspectorPreferenceReady) return;
    try {
      window.localStorage.setItem(inspectorWidthStorageKey, String(inspectorWidth));
    } catch {}
  }, [inspectorPreferenceReady, inspectorWidth]);

  useEffect(() => {
    function keepInspectorWithinViewport() {
      setInspectorWidth((current) => Math.min(maximumInspectorWidth(), current));
    }
    window.addEventListener("resize", keepInspectorWithinViewport);
    return () => window.removeEventListener("resize", keepInspectorWithinViewport);
  }, []);

  function cloneCanvas(source: CanvasSnapshot): CanvasSnapshot {
    return {
      nodes: source.nodes.map((node) => ({ ...node })),
      edges: source.edges.map((edge) => ({ ...edge })),
    };
  }

  function updateHistoryState() {
    setHistoryState({ canUndo: undoStack.current.length > 0, canRedo: redoStack.current.length > 0 });
  }

  function recordUndo(snapshot: CanvasSnapshot) {
    undoStack.current = [...undoStack.current, cloneCanvas(snapshot)].slice(-60);
    redoStack.current = [];
    updateHistoryState();
  }

  function commitCanvas(update: (current: CanvasSnapshot) => CanvasSnapshot) {
    const before = cloneCanvas(blueprint);
    const after = update(cloneCanvas(before));
    recordUndo(before);
    setBlueprint((current) => ({ ...current, nodes: after.nodes, edges: after.edges }));
  }

  function clearHistory() {
    undoStack.current = [];
    redoStack.current = [];
    updateHistoryState();
  }

  function undoCanvas() {
    const previous = undoStack.current.at(-1);
    if (!previous) return;
    redoStack.current = [...redoStack.current, cloneCanvas(blueprint)].slice(-60);
    undoStack.current = undoStack.current.slice(0, -1);
    setBlueprint((current) => ({ ...current, ...cloneCanvas(previous) }));
    setSelection(null);
    updateHistoryState();
  }

  function redoCanvas() {
    const next = redoStack.current.at(-1);
    if (!next) return;
    undoStack.current = [...undoStack.current, cloneCanvas(blueprint)].slice(-60);
    redoStack.current = redoStack.current.slice(0, -1);
    setBlueprint((current) => ({ ...current, ...cloneCanvas(next) }));
    setSelection(null);
    updateHistoryState();
  }

  function updateBlueprint<Key extends keyof BlueprintFile>(key: Key, value: BlueprintFile[Key]) {
    setBlueprint((current) => ({ ...current, [key]: value }));
  }

  function updateField(key: FieldKey, value: string) {
    updateBlueprint(key, value);
  }

  function updateNode(nodeId: string, patch: Partial<CanvasNode>) {
    setBlueprint((current) => ({
      ...current,
      nodes: current.nodes.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
    }));
  }

  function updateEdge(edgeId: string, patch: Partial<CanvasEdge>) {
    setBlueprint((current) => ({
      ...current,
      edges: current.edges.map((edge) => (edge.id === edgeId ? { ...edge, ...patch } : edge)),
    }));
  }

  function deleteSelection() {
    if (!selection) return;
    commitCanvas((current) => {
      if (selection.type === "edge") {
        return { ...current, edges: current.edges.filter((edge) => edge.id !== selection.id) };
      }
      return {
        nodes: current.nodes.filter((node) => node.id !== selection.id),
        edges: current.edges.filter((edge) => edge.from !== selection.id && edge.to !== selection.id),
      };
    });
    setSelection(null);
  }

  function handleNodeActivation(nodeId: string) {
    if (!connectMode) {
      setSelection({ type: "node", id: nodeId });
      return;
    }

    if (!connectSourceId) {
      setConnectSourceId(nodeId);
      setSelection({ type: "node", id: nodeId });
      return;
    }

    if (connectSourceId === nodeId) {
      setConnectSourceId(null);
      return;
    }

    let index = blueprint.edges.length + 1;
    const ids = new Set(blueprint.edges.map((edge) => edge.id));
    while (ids.has(`edge-${index}`)) index += 1;
    const edge: CanvasEdge = {
      id: `edge-${index}`,
      from: connectSourceId,
      to: nodeId,
      type: connectionType,
    };
    commitCanvas((current) => ({ ...current, edges: [...current.edges, edge] }));
    setSelection({ type: "edge", id: edge.id });
    setConnectSourceId(null);
    setConnectMode(false);
  }

  function clampZoom(value: number) {
    return Math.min(Math.max(value, minZoom), maxZoom);
  }

  function screenToCanvas(clientX: number, clientY: number, nextViewport = viewport) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return { x: 0, y: 0 };
    return {
      x: (clientX - bounds.left - nextViewport.x) / nextViewport.zoom,
      y: (clientY - bounds.top - nextViewport.y) / nextViewport.zoom,
    };
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, node: CanvasNode) {
    event.stopPropagation();
    if (connectMode) {
      event.preventDefault();
      suppressNodeClick.current = true;
      handleNodeActivation(node.id);
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    setSelection({ type: "node", id: node.id });
    const pointer = screenToCanvas(event.clientX, event.clientY);
    setDragState({
      nodeId: node.id,
      offsetX: pointer.x - node.x,
      offsetY: pointer.y - node.y,
      snapshot: cloneCanvas(blueprint),
      didMove: false,
    });
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (!dragState) return;
    event.stopPropagation();
    const pointer = screenToCanvas(event.clientX, event.clientY);
    const nextX = Math.min(Math.max(pointer.x - dragState.offsetX, 12), canvasWorld.width - nodeSize.width - 12);
    const nextY = Math.min(Math.max(pointer.y - dragState.offsetY, 12), canvasWorld.height - nodeSize.height - 12);
    updateNode(dragState.nodeId, { x: Math.round(nextX), y: Math.round(nextY) });
    if (!dragState.didMove) setDragState((current) => (current ? { ...current, didMove: true } : current));
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (dragState) event.currentTarget.releasePointerCapture(event.pointerId);
    if (dragState?.didMove) recordUndo(dragState.snapshot);
    setDragState(null);
  }

  function beginPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest(".canvas-node")) return;
    if (target.closest(".edge-hit-area")) return;
    setSelection(null);
    event.currentTarget.setPointerCapture(event.pointerId);
    setPanState({
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: viewport.x,
      startY: viewport.y,
    });
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    if (!panState) return;
    setViewport((current) => ({
      ...current,
      x: panState.startX + event.clientX - panState.startClientX,
      y: panState.startY + event.clientY - panState.startClientY,
    }));
  }

  function endPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (panState?.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setPanState(null);
  }

  function zoomAt(clientX: number, clientY: number, nextZoom: number) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const zoom = clampZoom(nextZoom);
    setViewport((current) => {
      const before = {
        x: (clientX - bounds.left - current.x) / current.zoom,
        y: (clientY - bounds.top - current.y) / current.zoom,
      };
      return {
        zoom,
        x: clientX - bounds.left - before.x * zoom,
        y: clientY - bounds.top - before.y * zoom,
      };
    });
  }

  function handleWheel(event: ReactWheelEvent<HTMLDivElement>) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? -0.08 : 0.08;
    zoomAt(event.clientX, event.clientY, viewport.zoom + delta);
  }

  function zoomBy(delta: number) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    zoomAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, viewport.zoom + delta);
  }

  function fitNodes(nodes: CanvasNode[]) {
    const bounds = canvasRef.current?.getBoundingClientRect();
    if (!bounds) return;
    if (nodes.length === 0) {
      resetViewport();
      return;
    }
    const padding = 64;
    const minX = Math.min(...nodes.map((node) => node.x));
    const minY = Math.min(...nodes.map((node) => node.y));
    const maxX = Math.max(...nodes.map((node) => node.x + nodeSize.width));
    const maxY = Math.max(...nodes.map((node) => node.y + nodeSize.height));
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;
    const zoom = clampZoom(Math.min(bounds.width / contentWidth, bounds.height / contentHeight, 1.25));
    setViewport({
      zoom,
      x: (bounds.width - (maxX - minX) * zoom) / 2 - minX * zoom,
      y: (bounds.height - (maxY - minY) * zoom) / 2 - minY * zoom,
    });
  }

  function fitCanvas() {
    fitNodes(blueprint.nodes);
  }

  function resetViewport() {
    setViewport(initialViewport);
  }

  function addNode(kind: NodeKind = "gate") {
    const count = blueprint.nodes.length + 1;
    const existingIds = new Set(blueprint.nodes.map((node) => node.id));
    let nextIndex = count;
    let nextId = `${kind}-${nextIndex}`;
    while (existingIds.has(nextId)) {
      nextIndex += 1;
      nextId = `${kind}-${nextIndex}`;
    }
    const bounds = canvasRef.current?.getBoundingClientRect();
    const center = bounds
      ? screenToCanvas(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2)
      : { x: 2800, y: 2000 };
    const newNode: CanvasNode = {
      id: nextId,
      kind,
      title: localizedNodeKinds.find((item) => item.id === kind)?.label ?? "Node",
      detail: t("describeHitmStep"),
      owner: kind === "ai" ? t("aiAssists") : t("humanOwner"),
      x: Math.round(Math.min(Math.max(center.x - nodeSize.width / 2 + (count % 4) * 14, 12), canvasWorld.width - nodeSize.width - 12)),
      y: Math.round(Math.min(Math.max(center.y - nodeSize.height / 2 + (count % 4) * 14, 12), canvasWorld.height - nodeSize.height - 12)),
    };
    commitCanvas((current) => ({ ...current, nodes: [...current.nodes, newNode] }));
    setSelection({ type: "node", id: newNode.id });
    setWorkspacePanel("library");
    setCurrentFlowStep("workflow");
  }

  function resetDemo() {
    setBlueprint({
      ...demoBlueprint,
      warningResolutions: [],
      nodes: demoBlueprint.nodes.map((node) => ({ ...node })),
      edges: demoBlueprint.edges.map((edge) => ({ ...edge })),
    });
    setSelection({ type: "node", id: "review-gate" });
    setConnectMode(false);
    setConnectSourceId(null);
    setCurrentFlowStep("context");
    setGovernanceExpanded(false);
    setIntakeCollapsed(false);
    clearHistory();
    setStorageBlocked(false);
    window.requestAnimationFrame(() => fitNodes(demoBlueprint.nodes));
  }

  function startBlank() {
    const blank = createBlankBlueprint();
    setBlueprint(blank);
    setSelection(null);
    setWorkspacePanel("library");
    setCurrentFlowStep("workflow");
    setIntakeCollapsed(true);
    setConnectMode(false);
    setConnectSourceId(null);
    clearHistory();
    setStorageBlocked(false);
    window.requestAnimationFrame(resetViewport);
  }

  function requestProjectReset(target: ProjectResetTarget) {
    rememberDialogOpener();
    setPendingProjectReset(target);
  }

  function rememberDialogOpener() {
    const active = document.activeElement as HTMLElement | null;
    setDialogOpener(moreDisclosure.containerRef.current?.contains(active) ? moreDisclosure.triggerRef.current : active);
  }

  function confirmProjectReset() {
    if (pendingProjectReset === "demo") resetDemo();
    if (pendingProjectReset === "blank") startBlank();
    setPendingProjectReset(null);
  }

  function applyTemplate(templateId: string) {
    const template = localizedWorkflowTemplates.find((item) => item.id === templateId);
    if (!template) return;
    const nodes = template.nodes.map((node) => ({ ...node }));
    const edges = template.edges.map((edge) => ({ ...edge }));
    recordUndo(cloneCanvas(blueprint));
    setBlueprint((current) => ({ ...current, nodes, edges, warningResolutions: [] }));
    setSelection({ type: "node", id: nodes[0]?.id ?? "" });
    setActiveView("canvas");
    setWorkspacePanel("workflow");
    setCurrentFlowStep("workflow");
    setIntakeCollapsed(true);
    setTemplateOpen(false);
    updateHistoryState();
    window.requestAnimationFrame(() => fitNodes(nodes));
  }

  function applyGeneratedWorkflow(reason: "manual" | "continue" = "manual") {
    const selectedPatternId = blueprint.selectedPattern || recommendedPatternIds[0] || "";
    const snapshot = generateDraftWorkflow({ ...blueprint, selectedPattern: selectedPatternId }, locale);
    recordUndo(cloneCanvas(blueprint));
    setBlueprint((current) => ({
      ...current,
      selectedPattern: current.selectedPattern || selectedPatternId,
      nodes: snapshot.nodes,
      edges: snapshot.edges,
      warningResolutions: [],
    }));
    setSelection({ type: "node", id: snapshot.nodes[0]?.id ?? "" });
    setActiveView("canvas");
    setWorkspacePanel("workflow");
    setCurrentFlowStep("workflow");
    setIntakeCollapsed(true);
    updateHistoryState();
    window.requestAnimationFrame(() => fitNodes(snapshot.nodes));
    if (reason === "continue") setTemplateOpen(false);
  }

  function generateFromIntake() {
    applyGeneratedWorkflow("manual");
  }

  function createAlternative(kind: AlternativeKind) {
    const alternative = createBlueprintAlternative(blueprint, kind, locale);
    setBlueprint((current) => ({ ...current, alternatives: [...current.alternatives, alternative] }));
    setAdoptedAlternativeId(null);
    setActiveView("alternatives");
  }

  function adoptAlternative(alternative: BlueprintAlternative) {
    const adopted = applyBlueprintAlternative(blueprint, alternative, locale);
    setBlueprint(adopted);
    setSelection(adopted.nodes[0] ? { type: "node", id: adopted.nodes[0].id } : null);
    setWorkspacePanel("workflow");
    setCurrentFlowStep("workflow");
    setActiveView("alternatives");
    setIntakeCollapsed(true);
    setAdoptedAlternativeId(alternative.id);
    clearHistory();
    window.requestAnimationFrame(() => fitNodes(adopted.nodes));
  }

  function setWarningResolution(warningId: string, status: "resolved" | "exception", note: string) {
    setBlueprint((current) => ({
      ...current,
      warningResolutions: updateWarningResolution(current.warningResolutions, warningId, status, note),
    }));
  }

  function reopenWarning(warningId: string) {
    setBlueprint((current) => ({
      ...current,
      warningResolutions: clearWarningResolution(current.warningResolutions, warningId),
    }));
  }

  function toggleConnectMode() {
    setConnectMode((current) => !current);
    setConnectSourceId(null);
    setTemplateOpen(false);
  }

  function continueBlueprint() {
    if (blueprint.nodes.length === 0) {
      applyGeneratedWorkflow("continue");
      return;
    }

    if (!blueprint.selectedPattern && recommendedPatternIds[0]) {
      updateBlueprint("selectedPattern", recommendedPatternIds[0]);
    }

    if (currentFlowStep === "context") {
      goToStep("workflow");
      return;
    }

    if (currentFlowStep === "workflow") {
      goToStep("ownership");
      return;
    }

    if (currentFlowStep === "ownership") {
      goToStep("governance");
      return;
    }

    if (currentFlowStep === "governance") {
      goToStep("stress");
      return;
    }

    if (currentFlowStep === "stress") {
      if (warnings.some((warning) => warning.status === "open")) {
        setActiveView("checks");
        return;
      }
      goToStep("export");
      return;
    }

    if (activeView === "prompts") {
      setActiveView("report");
      return;
    }

    window.print();
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify({ blueprint, report, prompts }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hitm-blueprint-backup-${projectFilenameStem(blueprint.projectName)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printReport() {
    setActiveView("report");
    setMoreActionsOpen(false);
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => window.print()));
  }

  function requestImport() {
    importInputRef.current?.click();
  }

  async function importBlueprint(event: ReactChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());
      const imported = parseBlueprintBackup(parsed);
      setBlueprint(imported);
      setStorageBlocked(false);
      setImportFailed(false);
      setSelection(imported.nodes[0] ? { type: "node", id: imported.nodes[0].id } : null);
      setWorkspacePanel(imported.nodes.length ? "workflow" : "intake");
      setCurrentFlowStep(imported.nodes.length ? "workflow" : "context");
      setIntakeCollapsed(Boolean(imported.nodes.length));
      setGovernanceExpanded(false);
      setActiveView("canvas");
      clearHistory();
      window.requestAnimationFrame(() => imported.nodes.length ? fitNodes(imported.nodes) : resetViewport());
    } catch {
      setImportFailed(true);
    }
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(updateHistoryState);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (event.defaultPrevented || helpOpen || pendingProjectReset || target?.closest(".top-menu, .template-control")) return;
      if (target?.matches("input, textarea, select, [contenteditable='true']")) return;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redoCanvas();
        else undoCanvas();
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        deleteSelection();
      }

      if (event.key === "Escape") {
        setConnectMode(false);
        setConnectSourceId(null);
        setTemplateOpen(false);
        setHelpOpen(false);
        setPendingProjectReset(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <TranslationContext.Provider value={{ locale, t }}>
    <main className="blueprint-shell">
      <header className="studio-topbar">
        <div className="brand-block">
          <div className="brand-mark" aria-hidden="true">
            <Workflow size={24} />
          </div>
          <div>
            <h1>HITM Blueprint Studio</h1>
            <span className="beta-label">{t("betaPreview")} · {releaseVersion}</span>
            <p>{t("appTagline")}</p>
          </div>
        </div>

        <div className="project-switcher">
          <span>{t("project")}</span>
          <strong>{blueprint.projectName || t("untitledBlueprint")}</strong>
          <small className={cx("project-save-state", (importFailed || storageBlocked || saveFailed) && "is-problem")} role="status">
            {!storageReady ? t("loadingLocalDraft") : importFailed ? t("couldNotImport") : storageBlocked ? t("couldNotLoad") : saveFailed ? t("couldNotSave") : t("savedLocally")}
          </small>
        </div>

        <div className="top-actions">
          <div className="language-switcher" aria-label={t("language")} role="group">
            {supportedLocales.map((language) => (
              <button
                aria-pressed={locale === language.id}
                className={cx(locale === language.id && "is-active")}
                key={language.id}
                onClick={() => setLocale(language.id)}
                title={language.label}
                type="button"
              >
                {language.shortLabel}
              </button>
            ))}
          </div>
          <button
            aria-expanded={!intakeCollapsed}
            className="ghost-button project-brief-button"
            onClick={() => setIntakeCollapsed((current) => !current)}
            type="button"
          >
            <ListTree size={16} />
            {t("projectBrief")}
          </button>
          <div className="top-menu" ref={moreDisclosure.containerRef} onKeyDown={moreDisclosure.onKeyDown}>
            <button
              aria-controls="more-actions-panel"
              aria-expanded={moreActionsOpen}
              className="ghost-button"
              ref={moreDisclosure.triggerRef}
              onClick={() => setMoreActionsOpen((current) => !current)}
              type="button"
            >
              {t("more")}
              <ChevronDown size={15} />
            </button>
            {moreActionsOpen ? (
              <div className="top-menu-panel" id="more-actions-panel" ref={moreDisclosure.panelRef}>
                <button onClick={() => { requestProjectReset("demo"); setMoreActionsOpen(false); }} type="button"><commandIcons.demo size={16} /> {t("demoProject")}</button>
                <button onClick={() => { requestProjectReset("blank"); setMoreActionsOpen(false); }} type="button"><RefreshCw size={16} /> {t("startBlank")}</button>
                <button onClick={() => { generateFromIntake(); setMoreActionsOpen(false); }} type="button"><Workflow size={16} /> {t("generateFromBrief")}</button>
                <button onClick={() => { rememberDialogOpener(); setHelpOpen(true); setMoreActionsOpen(false); }} type="button"><CircleHelp size={16} /> {t("howToUse")}</button>
                <button onClick={() => { setImportFailed(false); requestImport(); setMoreActionsOpen(false); }} type="button"><Upload size={16} /> {t("importBlueprint")}</button>
                <button onClick={() => { exportJson(); setMoreActionsOpen(false); }} type="button"><Download size={16} /> {t("exportBackup")}</button>
                <button onClick={printReport} type="button"><Printer size={16} /> {t("printReport")}</button>
                <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/help/#${locale === "de" ? "deutsch" : "english"}`} target="_blank" rel="noopener noreferrer"><CircleHelp size={16} /> {t("manual")}</a>
                <a href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/help/#${locale}-release`} target="_blank" rel="noopener noreferrer">{t("sourceFeedback")}</a>
                <a href="https://schmidtpabst.com" target="_blank" rel="noopener noreferrer">{t("madeBy")}</a>
              </div>
            ) : null}
          </div>
          <button className="primary-button" onClick={continueBlueprint}>
            <Share2 size={16} />
            {continueLabel}
          </button>
        </div>
      </header>
      <input accept="application/json,.json" aria-label="Import Blueprint Studio export" className="visually-hidden" onChange={importBlueprint} ref={importInputRef} type="file" />
      {helpOpen ? (
        <AccessibleDialog titleId="guide-dialog-title" onClose={() => setHelpOpen(false)} returnFocusTo={dialogOpener}>
            <div className="guide-dialog-head">
              <div>
                <span>{t("quickGuide")}</span>
                <h2 id="guide-dialog-title">{t("buildWorkflow")}</h2>
              </div>
              <button aria-label={t("closeQuickGuide")} className="tool-icon" onClick={() => setHelpOpen(false)} type="button"><X size={16} /></button>
            </div>
            <p>{t("guideIntro")}</p>
            <div className="guide-steps">
              <button onClick={() => { goToStep("context"); setHelpOpen(false); }} type="button"><span>1</span><strong>{t("guideOneTitle")}</strong><small>{t("guideOneDetail")}</small></button>
              <button onClick={() => { goToStep("workflow"); setHelpOpen(false); }} type="button"><span>2</span><strong>{t("guideTwoTitle")}</strong><small>{t("guideTwoDetail")}</small></button>
              <button onClick={() => { goToStep("ownership"); setHelpOpen(false); }} type="button"><span>3</span><strong>{t("guideThreeTitle")}</strong><small>{t("guideThreeDetail")}</small></button>
              <button onClick={() => { goToStep("stress"); setHelpOpen(false); }} type="button"><span>4</span><strong>{t("guideFourTitle")}</strong><small>{t("guideFourDetail")}</small></button>
            </div>
            <div className="guide-dialog-foot"><Check size={16} /> {t("savedInBrowser")}</div>
        </AccessibleDialog>
      ) : null}
      {pendingProjectReset ? (
        <AccessibleDialog titleId="reset-dialog-title" className="reset-dialog" onClose={() => setPendingProjectReset(null)} returnFocusTo={dialogOpener}>
            <div className="guide-dialog-head">
              <div>
                <span>{t("replaceProject")}</span>
                <h2 id="reset-dialog-title">{pendingProjectReset === "demo" ? t("loadDemoQuestion") : t("blankQuestion")}</h2>
              </div>
              <button aria-label={t("cancelProjectReplacement")} className="tool-icon" onClick={() => setPendingProjectReset(null)} type="button"><X size={16} /></button>
            </div>
            <p>{t("resetWarning")}</p>
            <div className="reset-dialog-actions">
              <button className="ghost-button" data-dialog-initial-focus onClick={() => setPendingProjectReset(null)} type="button">{t("cancel")}</button>
              <button className="primary-button" onClick={confirmProjectReset} type="button">
                {pendingProjectReset === "demo" ? t("loadDemo") : t("startBlank")}
                <ArrowRight size={16} />
              </button>
            </div>
        </AccessibleDialog>
      ) : null}

      <section className="stepper" aria-label="Blueprint flow">
        {localizedStepItems.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStepIndex;
          const isDone = index < activeStepIndex || completion > 85;
          return (
            <button
              aria-current={isActive ? "step" : undefined}
              className={cx("step-item", isActive && "is-active", isDone && "is-done")}
              key={step.id}
              onClick={() => goToStep(step.id)}
              type="button"
            >
              <span className="step-index">{isDone && !isActive ? <Check size={14} /> : index + 1}</span>
              <Icon size={17} />
              <span>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </span>
            </button>
          );
        })}
      </section>

      <section className={cx("studio-grid", intakeCollapsed && "is-intake-collapsed")} style={{ "--inspector-width": `${inspectorWidth}px` } as CSSProperties}>
        <IconRail activeView={activeView} onNavigate={openInspectorView} />

        <aside className={cx("intake-panel", intakeCollapsed && "is-collapsed")} aria-label="Canvas workspace tools">
          {intakeCollapsed ? (
            <button className="collapsed-intake-trigger" onClick={() => setIntakeCollapsed(false)} type="button">
              <ListTree size={18} />
              <span>{t("projectBrief")}</span>
              <ArrowRight size={15} />
            </button>
          ) : (
            <>
          <div className="intake-panel-bar">
            <strong>{t("projectBrief")}</strong>
            <button aria-label={t("projectBrief")} className="tool-icon" onClick={() => setIntakeCollapsed(true)} title={t("projectBrief")} type="button"><X size={15} /></button>
          </div>
          <div className="workspace-tabs" role="tablist" aria-label="Canvas workspace panels">
            <button
              aria-selected={workspacePanel === "intake"}
              className={cx(workspacePanel === "intake" && "is-active")}
              onClick={() => { setWorkspacePanel("intake"); setCurrentFlowStep("context"); }}
              role="tab"
              type="button"
            >
              {t("project")}
            </button>
            <button
              aria-selected={workspacePanel === "library"}
              className={cx(workspacePanel === "library" && "is-active")}
              onClick={() => { setWorkspacePanel("library"); setCurrentFlowStep("workflow"); }}
              role="tab"
              type="button"
            >
              {t("nodes")}
            </button>
            <button
              aria-selected={workspacePanel === "workflow"}
              className={cx(workspacePanel === "workflow" && "is-active")}
              onClick={() => { setWorkspacePanel("workflow"); setCurrentFlowStep("workflow"); }}
              role="tab"
              type="button"
            >
              {t("workflow")}
            </button>
          </div>

          {workspacePanel === "intake" ? (
            <>
              <PanelHeader title={t("projectIntake")} detail={t("complete", { count: completion })} />
              <Field label={t("projectName")} value={blueprint.projectName} onChange={(value) => updateField("projectName", value)} />
              <Field label={t("audience")} value={blueprint.audience} onChange={(value) => updateField("audience", value)} />
              <Area label={t("whatBuilding")} value={blueprint.projectGoal} onChange={(value) => updateField("projectGoal", value)} />

              <div className="start-paths" aria-label="Starting paths">
                <button onClick={() => requestProjectReset("blank")}>
                  <RefreshCw size={16} />
                  <span><strong>{t("blank")}</strong><small>{t("blankDetail")}</small></span>
                </button>
                <button className="is-recommended" onClick={generateFromIntake}>
                  <Workflow size={16} />
                  <span><strong>{t("generateFromIntake")}</strong><small>{t("generateDetail")}</small></span>
                </button>
                <button onClick={() => setTemplateOpen(true)}>
                  <LayoutTemplate size={16} />
                  <span><strong>{t("templates")}</strong><small>{t("templateDetail")}</small></span>
                </button>
              </div>

              <details className="intake-advanced">
                <summary>
                  <span><strong>{t("operatingDetails")}</strong><small>{t("operatingDetail")}</small></span>
                  <ChevronDown size={16} aria-hidden="true" />
                </summary>
                <div className="intake-advanced-content">
                  <Area label={t("whatAiDo")} value={blueprint.aiAssistance} onChange={(value) => updateField("aiAssistance", value)} />
                  <Area label={t("humanControl")} value={blueprint.humanControl} onChange={(value) => updateField("humanControl", value)} />
                  <Area label={t("sourceMaterial")} value={blueprint.sourceMaterial} onChange={(value) => updateField("sourceMaterial", value)} />
                  <div className="select-grid">
                    <SelectField label={t("sensitivity")} value={blueprint.sensitivity} options={[["public", t("public")], ["internal", t("internal")], ["sensitive", t("sensitive")]]} onChange={(value) => updateBlueprint("sensitivity", value as Sensitivity)} />
                    <SelectField label={t("complexity")} value={blueprint.complexity} options={[["simple", t("simple")], ["moderate", t("moderate")], ["complex", t("complex")]]} onChange={(value) => updateBlueprint("complexity", value as Complexity)} />
                    <SelectField label={t("automation")} value={blueprint.automationLevel} options={[["assistive", t("assistive")], ["reviewed", t("reviewed")], ["automated", t("automated")]]} onChange={(value) => updateBlueprint("automationLevel", value as AutomationLevel)} />
                    <SelectField label={t("capacity")} value={blueprint.teamCapacity} options={[["solo", t("solo")], ["small-team", t("smallTeam")], ["technical-team", t("technicalTeam")]]} onChange={(value) => updateBlueprint("teamCapacity", value as TeamCapacity)} />
                  </div>
                </div>
              </details>

              <button className="save-button" onClick={continueBlueprint}>
                {t("saveContinue")}
                <ArrowRight size={16} />
              </button>
            </>
          ) : null}

          {workspacePanel === "library" ? (
            <div className="workspace-panel-content">
              <PanelHeader title={t("nodeLibrary")} detail={t("hitmTypes", { count: localizedNodeKinds.length })} />
              <p className="muted-copy">{t("nodeLibraryHelp")}</p>
              <div className="node-library">
                {localizedNodeKinds.map((kind) => {
                  const Icon = kind.icon;
                  return (
                    <button className={`node-library-item node-${kind.id}`} key={kind.id} onClick={() => addNode(kind.id)}>
                      <span className="node-library-icon"><Icon size={17} /></span>
                      <span><strong>{kind.label}</strong><small>{kind.description}</small></span>
                      <Plus size={15} />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {workspacePanel === "workflow" ? (
            <div className="workspace-panel-content">
              <PanelHeader title={t("workflow")} detail={t("connections", { nodes: blueprint.nodes.length, edges: blueprint.edges.length })} />
              {blueprint.nodes.length ? (
                <div className="workflow-list">
                  {blueprint.nodes.map((node, index) => (
                    <button className={cx(selection?.type === "node" && selection.id === node.id && "is-selected")} key={node.id} onClick={() => setSelection({ type: "node", id: node.id })}>
                      <NodeBadge order={index + 1} />
                      <span><strong>{node.title}</strong><small>{localizedNodeKinds.find((kind) => kind.id === node.kind)?.label}</small></span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-panel-copy">
                  <p>{t("workflowEmpty")}</p>
                  <div className="empty-panel-actions">
                    <button onClick={generateFromIntake} type="button"><Workflow size={15} /> {t("generateDraft")}</button>
                    <button onClick={() => { setWorkspacePanel("library"); setCurrentFlowStep("workflow"); }} type="button"><Plus size={15} /> {t("addNode")}</button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
            </>
          )}
        </aside>

        <section className="canvas-zone" aria-label={t("workflowBlueprint")}>
          <div className="canvas-toolbar">
            <div className="toolbar-group">
              <button className="tool-button is-primary" onClick={() => { setWorkspacePanel("library"); setCurrentFlowStep("workflow"); }}>
                <Plus size={16} />
                {t("addNode")}
              </button>
              <button className={cx("tool-button", connectMode && "is-active")} onClick={toggleConnectMode} aria-pressed={connectMode}>
                <Workflow size={16} />
                {connectSourceId ? t("chooseTarget") : t("connect")}
              </button>
              {connectMode ? (
                <select className="connection-type-select" aria-label={t("connectionType")} value={connectionType} onChange={(event) => setConnectionType(event.target.value as EdgeType)}>
                  {localizedEdgeTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
                </select>
              ) : null}
              <button
                aria-label={t("selectMode")}
                className={cx("tool-icon", !connectMode && "is-active")}
                title={t("selectMode")}
                onClick={() => { setConnectMode(false); setConnectSourceId(null); }}
                type="button"
              >
                <MousePointer2 size={17} />
              </button>
              <div className="template-control" ref={templateDisclosure.containerRef} onKeyDown={templateDisclosure.onKeyDown}>
                <button className="tool-button" ref={templateDisclosure.triggerRef} aria-controls="workflow-templates-panel" onClick={() => setTemplateOpen((current) => !current)} aria-expanded={templateOpen} type="button">
                  <LayoutTemplate size={16} />
                  {t("templates")}
                  <ChevronDown size={14} />
                </button>
                {templateOpen ? (
                  <div className="template-menu" id="workflow-templates-panel" ref={templateDisclosure.panelRef}>
                    <div className="template-menu-head"><strong>{t("workflowTemplates")}</strong><button aria-label={t("closeTemplates")} onClick={() => setTemplateOpen(false)}><X size={15} /></button></div>
                    {localizedWorkflowTemplates.map((template) => (
                      <button className="template-option" key={template.id} onClick={() => applyTemplate(template.id)}>
                        <LayoutTemplate size={18} />
                        <span><strong>{template.title}</strong><small>{template.description}</small></span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <button
                aria-expanded={canvasControlsOpen}
                className="canvas-controls-toggle tool-button"
                onClick={() => setCanvasControlsOpen((current) => !current)}
                type="button"
              >
                <LocateFixed size={16} />
                {t("canvasControls")}
                <ChevronDown size={14} />
              </button>
            </div>
            <div className={cx("toolbar-group", "toolbar-group-end", canvasControlsOpen && "is-open")}>
              <button aria-label={t("undo")} className="tool-icon" title={t("undo")} disabled={!canUndo} onClick={undoCanvas} suppressHydrationWarning type="button"><Undo2 size={17} /></button>
              <button aria-label={t("redo")} className="tool-icon" title={t("redo")} disabled={!canRedo} onClick={redoCanvas} suppressHydrationWarning type="button"><Redo2 size={17} /></button>
              <button aria-label={t("deleteSelected")} className="tool-icon is-danger" title={t("deleteSelected")} disabled={!selection} onClick={deleteSelection} type="button"><Trash2 size={17} /></button>
              <div className="zoom-box">
                <button aria-label={t("zoomOut")} onClick={() => zoomBy(-0.12)}>−</button>
                <span>{Math.round(viewport.zoom * 100)}%</span>
                <button aria-label={t("zoomIn")} onClick={() => zoomBy(0.12)}>+</button>
              </div>
              <button aria-label={t("resetView")} className="tool-icon" title={t("resetView")} onClick={resetViewport} type="button"><LocateFixed size={17} /></button>
              <button aria-label={t("fitWorkflow")} className="tool-icon" title={t("fitWorkflow")} onClick={fitCanvas} type="button"><Maximize2 size={17} /></button>
            </div>
            <div className="canvas-status-strip" role="status">
              <span>{blueprint.nodes.length} {t("nodes").toLowerCase()}</span>
              <span>{blueprint.edges.length} {locale === "de" ? "Verbindungen" : "connections"}</span>
              <span>{openWarningCount ? t("checksNeedReview", { count: openWarningCount }) : t("checksClear")}</span>
              <span className="canvas-selection-status">{selectedSummary}</span>
              <span className="canvas-help-status">{t("canvasHelp")}</span>
            </div>
          </div>

          <div
            className={cx("canvas-surface", panState && "is-panning", connectMode && "is-connecting")}
            onPointerDown={beginPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            onWheel={handleWheel}
            ref={canvasRef}
            style={{
              backgroundPosition: `${viewport.x}px ${viewport.y}px`,
              backgroundSize: `${16 * viewport.zoom}px ${16 * viewport.zoom}px, ${16 * viewport.zoom}px ${16 * viewport.zoom}px, ${80 * viewport.zoom}px ${80 * viewport.zoom}px, ${80 * viewport.zoom}px ${80 * viewport.zoom}px`,
            }}
          >
            <MiniMap nodes={blueprint.nodes} viewport={viewport} />
            {connectMode ? (
              <div className="connect-hint" role="status">
                <Workflow size={15} />
                {connectSourceId ? t("selectDestination") : t("selectSource")}
                <button aria-label={t("cancelConnection")} onClick={(event) => { event.stopPropagation(); toggleConnectMode(); }}><X size={14} /></button>
              </div>
            ) : null}
            {blueprint.nodes.length === 0 ? (
              <div className="canvas-empty-state">
                <span className="empty-state-icon"><ListTree size={24} /></span>
                <h2>{t("startWorkflow")}</h2>
                <p>{t("startWorkflowDetail")}</p>
                <div>
                  <button className="primary-button" onClick={(event) => { event.stopPropagation(); generateFromIntake(); }}><Workflow size={16} /> {t("generateDraft")}</button>
                  <button className="primary-button" onClick={(event) => { event.stopPropagation(); setWorkspacePanel("library"); setCurrentFlowStep("workflow"); }}><Plus size={16} /> {t("addFirstNode")}</button>
                  <button className="ghost-button" onClick={(event) => { event.stopPropagation(); setTemplateOpen(true); }}><LayoutTemplate size={16} /> {t("useTemplate")}</button>
                </div>
              </div>
            ) : null}
            <div
              className="canvas-content"
              style={{
                width: canvasWorld.width,
                height: canvasWorld.height,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
              }}
            >
              <svg className="edge-layer" viewBox={`0 0 ${canvasWorld.width} ${canvasWorld.height}`}>
                <defs>
                  <marker id="arrow" markerHeight="8" markerWidth="8" orient="auto" refX="7" refY="4">
                    <path d="M0,0 L8,4 L0,8 Z" fill="currentColor" />
                  </marker>
                </defs>
                {blueprint.edges.map((edge) => {
                  const from = blueprint.nodes.find((node) => node.id === edge.from);
                  const to = blueprint.nodes.find((node) => node.id === edge.to);
                  if (!from || !to) return null;
                  const geometry = getEdgeGeometry(from, to);
                  const isSelected = selection?.type === "edge" && selection.id === edge.id;
                  return (
                    <g className={cx("edge-group", `edge-${edge.type}`, isSelected && "is-selected")} key={edge.id} onPointerDown={(event) => event.stopPropagation()} onClick={() => setSelection({ type: "edge", id: edge.id })}>
                      <path className="edge-hit-area" d={geometry.path} />
                      <path className="edge-path" d={geometry.path} markerEnd="url(#arrow)" />
                      {edge.label ? (
                        <text className="edge-label" textAnchor="middle" x={geometry.labelX} y={geometry.labelY}>
                          {edge.label}
                        </text>
                      ) : null}
                    </g>
                  );
                })}
              </svg>

              {blueprint.nodes.map((node, index) => (
                <button
                  className={cx(
                    "canvas-node",
                    `node-${node.kind}`,
                    selection?.type === "node" && selection.id === node.id && "is-selected",
                    connectSourceId === node.id && "is-connect-source",
                  )}
                  key={node.id}
                  onClick={() => {
                    if (suppressNodeClick.current) {
                      suppressNodeClick.current = false;
                      return;
                    }
                    if (!connectMode) handleNodeActivation(node.id);
                  }}
                  onPointerDown={(event) => beginDrag(event, node)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  style={{ left: node.x, top: node.y }}
                >
                  <NodeBadge order={index + 1} />
                  <span className="node-copy">
                    <strong>{node.title}</strong>
                    <small>{node.detail}</small>
                    <em>{node.owner}</em>
                  </span>
                  <Grip className="node-grip" size={15} />
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="inspector-panel" aria-label="Inspector and report" id="blueprint-inspector">
          <button
            aria-controls="blueprint-inspector"
            aria-label="Resize inspector. Drag left to make it wider or use the arrow keys."
            aria-orientation="vertical"
            aria-valuemax={inspectorMaximumWidth}
            aria-valuemin={inspectorMinWidth}
            aria-valuenow={inspectorWidth}
            aria-valuetext={`${inspectorWidth} pixels wide`}
            className="inspector-resize-handle"
            onKeyDown={handleInspectorResizeKey}
            onPointerCancel={endInspectorResize}
            onPointerDown={beginInspectorResize}
            onPointerMove={moveInspectorResize}
            onPointerUp={endInspectorResize}
            role="separator"
            title="Drag to resize inspector"
            type="button"
          >
            <span aria-hidden="true" />
          </button>
          <div className="view-tabs" role="tablist" aria-label="Inspector views">
            {(["canvas", "checks", "matrix", "alternatives", "prompts", "report"] as ActiveView[]).map((view) => (
              <button
                aria-selected={activeView === view}
                className={cx(activeView === view && "is-active")}
                key={view}
                onClick={() => openInspectorView(view)}
                role="tab"
                type="button"
              >
                {view === "alternatives" ? t("alternatives") : t(view)}
                {view === "checks" && warnings.some((warning) => warning.status === "open") ? (
                  <span className="tab-badge">{openWarningCount}</span>
                ) : null}
              </button>
            ))}
          </div>

          {activeView === "canvas" ? (
            <CanvasInspector
              blueprint={blueprint}
              node={selectedNode}
              edge={selectedEdge}
              recommendedPatternIds={recommendedPatternIds}
              selectedPattern={selectedPattern}
              governanceExpanded={governanceExpanded}
              onGovernanceExpandedChange={setGovernanceExpanded}
              updateNode={updateNode}
              updateEdge={updateEdge}
              updateBlueprint={updateBlueprint}
            />
          ) : null}

          {activeView === "checks" ? (
            <ChecksPanel warnings={warnings} onResolve={setWarningResolution} onReopen={reopenWarning} />
          ) : null}
          {activeView === "matrix" ? <OwnershipMatrix blueprint={blueprint} setBlueprint={setBlueprint} /> : null}
          {activeView === "alternatives" ? <AlternativesPanel blueprint={blueprint} onCreate={createAlternative} onAdopt={adoptAlternative} adoptedAlternativeId={adoptedAlternativeId} /> : null}
          {activeView === "prompts" ? <PromptPanel blueprint={blueprint} prompts={prompts} /> : null}
          {activeView === "report" ? <ReportPanel blueprint={blueprint} report={report} reportMarkdown={reportMarkdown} warnings={warnings} /> : null}
        </aside>
      </section>
    </main>
    </TranslationContext.Provider>
  );
}

function IconRail({ activeView, onNavigate }: { activeView: ActiveView; onNavigate: (view: ActiveView) => void }) {
  return (
    <nav className="icon-rail" aria-label="Studio areas">
      <button
        aria-label="Open canvas"
        aria-pressed={activeView === "canvas"}
        className={cx(activeView === "canvas" && "is-active")}
        onClick={() => onNavigate("canvas")}
        title="Canvas"
        type="button"
      >
        <Workflow size={20} />
      </button>
      <button
        aria-label="Open checks"
        aria-pressed={activeView === "checks"}
        className={cx(activeView === "checks" && "is-active")}
        onClick={() => onNavigate("checks")}
        title="Checks"
        type="button"
      >
        <Bot size={20} />
      </button>
      <button
        aria-label="Open report"
        aria-pressed={activeView === "report"}
        className={cx(activeView === "report" && "is-active")}
        onClick={() => onNavigate("report")}
        title="Report"
        type="button"
      >
        <commandIcons.export size={20} />
      </button>
      <button
        aria-label="Open prompts"
        aria-pressed={activeView === "prompts"}
        className={cx(activeView === "prompts" && "is-active")}
        onClick={() => onNavigate("prompts")}
        title="Prompts"
        type="button"
      >
        <commandIcons.prompt size={20} />
      </button>
    </nav>
  );
}

function PanelHeader({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="panel-header">
      <h2>{title}</h2>
      <span>{detail}</span>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field compact-field">
      <span>{label}</span>
      <select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map(([optionValue, labelText]) => (
          <option key={optionValue} value={optionValue}>
            {labelText}
          </option>
        ))}
      </select>
    </label>
  );
}

function MiniMap({ nodes, viewport }: { nodes: CanvasNode[]; viewport: CanvasViewport }) {
  return (
    <div className="mini-map" aria-hidden="true">
      <span
        className="mini-viewport"
        style={{
          left: `${Math.max((-viewport.x / viewport.zoom / canvasWorld.width) * 100, 0)}%`,
          top: `${Math.max((-viewport.y / viewport.zoom / canvasWorld.height) * 100, 0)}%`,
          width: `${Math.min((260 / viewport.zoom / canvasWorld.width) * 100, 100)}%`,
          height: `${Math.min((180 / viewport.zoom / canvasWorld.height) * 100, 100)}%`,
        }}
      />
      {nodes.map((node) => (
        <span
          className={`mini-node mini-${node.kind}`}
          key={node.id}
          style={{ left: `${(node.x / canvasWorld.width) * 100}%`, top: `${(node.y / canvasWorld.height) * 100}%` }}
        />
      ))}
    </div>
  );
}

function NodeBadge({ order }: { order: number }) {
  return <span className="node-badge">{order}</span>;
}

function CanvasInspector({
  blueprint,
  node,
  edge,
  recommendedPatternIds,
  selectedPattern,
  governanceExpanded,
  onGovernanceExpandedChange,
  updateNode,
  updateEdge,
  updateBlueprint,
}: {
  blueprint: BlueprintFile;
  node: CanvasNode | undefined;
  edge: CanvasEdge | undefined;
  recommendedPatternIds: StackPatternId[];
  selectedPattern: ReturnType<typeof getPatternById>;
  governanceExpanded: boolean;
  onGovernanceExpandedChange: (expanded: boolean) => void;
  updateNode: (nodeId: string, patch: Partial<CanvasNode>) => void;
  updateEdge: (edgeId: string, patch: Partial<CanvasEdge>) => void;
  updateBlueprint: <Key extends keyof BlueprintFile>(key: Key, value: BlueprintFile[Key]) => void;
}) {
  const { locale, t } = useStudioTranslation();
  const localizedNodeKinds = getNodeKinds(locale);
  const localizedEdgeTypes = getEdgeTypes(locale);
  const displayGates = blueprintForOutput(blueprint, locale).gates;
  return (
    <div className="inspector-scroll">
      <section className="inspector-section">
        <PanelHeader title={t("inspector")} detail={node ? t("selectedNode") : edge ? t("selectedConnection") : t("nothingSelected")} />
        {node ? (
          <div className="node-editor">
            <label className="field compact-field">
              <span>{t("nodeType")}</span>
              <select value={node.kind} onChange={(event) => updateNode(node.id, { kind: event.target.value as NodeKind })}>
                {localizedNodeKinds.map((kind) => <option key={kind.id} value={kind.id}>{kind.label}</option>)}
              </select>
            </label>
            <Field label={t("nodeTitle")} value={node.title} onChange={(value) => updateNode(node.id, { title: value })} />
            <Area label={t("nodeDetail")} value={node.detail} onChange={(value) => updateNode(node.id, { detail: value })} />
            <Field label={t("owner")} value={node.owner} onChange={(value) => updateNode(node.id, { owner: value })} />
            {["ai", "tool"].includes(node.kind) ? <>
              <SelectField label={t("dataApproval")} value={node.dataApproval ?? "unreviewed"} options={[["unreviewed", t("unreviewedData")], ["approved", t("approvedData")], ["rejected", t("rejectedData")]]} onChange={(value) => updateNode(node.id, { dataApproval: value as CanvasNode["dataApproval"] })} />
              <p className="muted-copy">{t("dataApprovalHelp")}</p>
            </> : null}
            <label className="node-stop-control"><input type="checkbox" checked={node.explicitStop ?? false} onChange={(event) => updateNode(node.id, { explicitStop: event.target.checked })} /> {t("explicitStop")}</label>
            <p className="muted-copy">{t("stopHelp")}</p>
          </div>
        ) : edge ? (
          <div className="node-editor">
            <label className="field">
              <span>{t("connectionType")}</span>
              <select value={edge.type} onChange={(event) => updateEdge(edge.id, { type: event.target.value as EdgeType })}>
                {localizedEdgeTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}
              </select>
            </label>
            <Field label={t("visibleLabel")} value={edge.label ?? ""} onChange={(value) => updateEdge(edge.id, { label: value })} />
            <div className="connection-summary">
              <span>{blueprint.nodes.find((item) => item.id === edge.from)?.title ?? t("missingSource")}</span>
              <ArrowRight size={15} />
              <span>{blueprint.nodes.find((item) => item.id === edge.to)?.title ?? t("missingTarget")}</span>
            </div>
          </div>
        ) : (
          <p className="muted-copy">{t("selectItem")}</p>
        )}
      </section>

      <details className="inspector-section gate-section" open={governanceExpanded} onToggle={(event) => onGovernanceExpandedChange(event.currentTarget.open)}>
        <summary>
          <PanelHeader title={t("governanceGates")} detail={t("requiredGates", { count: blueprint.gates.filter((gate) => gate.required).length })} />
          <ChevronDown size={16} aria-hidden="true" />
        </summary>
        <div className="gate-list">
          {displayGates.map((gate) => (
            <label className="gate-row" key={gate.id}>
              <input
                checked={gate.required}
                type="checkbox"
                onChange={(event) => updateBlueprint("gates", updateGate(blueprint.gates, gate.id, "required", event.target.checked))}
              />
              <span>
                <strong>{gate.label}</strong>
                <small>{gate.description}</small>
              </span>
              <em>{gate.required ? t("required") : t("optional")}</em>
            </label>
          ))}
        </div>
      </details>

      <section className="inspector-section">
        <PanelHeader title={t("stackTradeoffs")} detail={t("deterministicSuggestions")} />
        <div className="pattern-list">
          {recommendedPatternIds.map((id) => {
            const pattern = getStackPatterns(locale).find((item) => item.id === id);
            if (!pattern) return null;
            const Icon = pattern.icon;
            const isSelected = blueprint.selectedPattern === id;
            return (
              <button
                className={cx("pattern-row", isSelected && "is-selected")}
                key={id}
                onClick={() => updateBlueprint("selectedPattern", id)}
              >
                <Icon size={18} />
                <span>
                  <strong>{pattern.title}</strong>
                  <small>{pattern.fit}</small>
                </span>
              </button>
            );
          })}
        </div>
        <p className="pattern-note">
          {selectedPattern
            ? `${selectedPattern.title}: ${selectedPattern.tradeoff}`
            : t("choosePattern")}
        </p>
      </section>
    </div>
  );
}

function ChecksPanel({
  warnings,
  onResolve,
  onReopen,
}: {
  warnings: HitmWarning[];
  onResolve: (warningId: string, status: "resolved" | "exception", note: string) => void;
  onReopen: (warningId: string) => void;
}) {
  const { t } = useStudioTranslation();
  const [filter, setFilter] = useState<"open" | "resolved" | "exception" | "all">("open");
  const filterRef = useRef<HTMLDivElement>(null);
  function returnToFilter() {
    window.requestAnimationFrame(() => filterRef.current?.querySelector<HTMLButtonElement>("[aria-selected='true']")?.focus());
  }
  const openCount = warnings.filter((warning) => warning.status === "open").length;
  const exceptionCount = warnings.filter((warning) => warning.status === "exception").length;
  const resolvedCount = warnings.filter((warning) => warning.status === "resolved").length;
  const filteredWarnings = filter === "all" ? warnings : warnings.filter((warning) => warning.status === filter);

  return (
    <div className="inspector-scroll">
      <section className="inspector-section">
        <PanelHeader title={t("hitmChecks")} detail={t("checksSummary", { open: openCount, resolved: resolvedCount, exceptions: exceptionCount })} />
        <div className="check-summary">
          <span className={cx("check-pill", openCount === 0 && "is-clear")}>
            <AlertTriangle size={15} />
            {openCount === 0 ? t("noOpenWarnings") : t("openWarnings", { count: openCount })}
          </span>
          <p>
            {t("checksExplainer")}
          </p>
        </div>
      </section>

      <section className="inspector-section">
        {warnings.length ? (
          <>
          <div className="check-filters" role="tablist" aria-label={t("hitmChecks")} ref={filterRef}>
            {([
              ["open", t("open"), openCount],
              ["resolved", t("resolved"), resolvedCount],
              ["exception", t("exceptions"), exceptionCount],
              ["all", t("all"), warnings.length],
            ] as const).map(([value, label, count]) => (
              <button
                aria-selected={filter === value}
                className={cx(filter === value && "is-active")}
                key={value}
                onClick={() => setFilter(value)}
                onKeyDown={(event) => {
                  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const filters = ["open", "resolved", "exception", "all"] as const;
                  const index = filters.indexOf(filter);
                  const next = event.key === "Home" ? 0 : event.key === "End" ? 3 : (index + (event.key === "ArrowRight" ? 1 : 3)) % 4;
                  setFilter(filters[next]);
                  returnToFilter();
                }}
                role="tab"
                tabIndex={filter === value ? 0 : -1}
                type="button"
              >
                {label} <span>{count}</span>
              </button>
            ))}
          </div>
          <div className="warning-list">
            {filteredWarnings.map((warning) => (
              <WarningCard key={warning.id} warning={warning} onResolve={(...args) => { onResolve(...args); returnToFilter(); }} onReopen={(id) => { onReopen(id); returnToFilter(); }} />
            ))}
          </div>
          {filteredWarnings.length === 0 ? <p className="checks-filter-empty">{t("noChecksYet", { filter: filter === "open" ? t("open").toLowerCase() : filter === "all" ? t("all").toLowerCase() : t(filter === "resolved" ? "resolved" : "exceptions").toLowerCase() })}</p> : null}
          </>
        ) : (
          <div className="checks-empty">
            <Check size={18} />
            <strong>{t("allChecksPass")}</strong>
            <span>{t("allChecksDetail")}</span>
          </div>
        )}
      </section>
    </div>
  );
}

function WarningCard({
  warning,
  onResolve,
  onReopen,
}: {
  warning: HitmWarning;
  onResolve: (warningId: string, status: "resolved" | "exception", note: string) => void;
  onReopen: (warningId: string) => void;
}) {
  const { t } = useStudioTranslation();
  const [note, setNote] = useState(() => warning.note);

  return (
    <article className={cx("warning-card", `severity-${warning.severity}`, warning.status !== "open" && `is-${warning.status}`)}>
      <div className="warning-card-head">
        <span>{t(warning.severity)}</span>
        <em>{warning.status === "exception" ? t("exceptions") : t(warning.status)}</em>
      </div>
      <h3>{warning.title}</h3>
      <dl>
        <div>
          <dt>{t("trigger")}</dt>
          <dd>{warning.trigger}</dd>
        </div>
        <div>
          <dt>{t("missingControl")}</dt>
          <dd>{warning.missingControl}</dd>
        </div>
        <div>
          <dt>{t("recommendation")}</dt>
          <dd>{warning.recommendation}</dd>
        </div>
      </dl>
      <label className="field">
        <span>{t("resolutionNote")}</span>
        <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("resolutionPlaceholder")} />
      </label>
      <div className="warning-actions">
        <button onClick={() => onResolve(warning.id, "resolved", note || t("markResolved"))}>
          {t("markResolved")}
        </button>
        <button disabled={!note.trim()} onClick={() => onResolve(warning.id, "exception", note)}>
          {t("documentException")}
        </button>
        {warning.status !== "open" ? <button onClick={() => onReopen(warning.id)}>{t("reopen")}</button> : null}
      </div>
    </article>
  );
}

function OwnershipMatrix({
  blueprint,
  setBlueprint,
}: {
  blueprint: BlueprintFile;
  setBlueprint: (value: (current: BlueprintFile) => BlueprintFile) => void;
}) {
  const { locale, t } = useStudioTranslation();
  const localizedNodeKinds = getNodeKinds(locale);
  blueprint = blueprintForOutput(blueprint, locale);
  return (
    <div className="inspector-scroll">
      <section className="inspector-section">
        <PanelHeader title={t("ownershipMatrix")} detail={t("humanControlMap")} />
        <div className="matrix-table">
          <div className="matrix-head">
            <span>{t("area")}</span>
            <span>{t("humanOwner")}</span>
            <span>{t("aiRole")}</span>
            <span>{t("approval")}</span>
          </div>
          {blueprint.ownership.map((item) => (
            <div className="matrix-row" key={item.id}>
              <strong>{item.area}</strong>
              <input
                value={item.humanOwner}
                aria-label={`${item.area}: ${t("humanOwner")}`}
                onChange={(event) =>
                  setBlueprint((current) => ({
                    ...current,
                    ownership: updateOwnership(current.ownership, item.id, "humanOwner", event.target.value),
                  }))
                }
              />
              <textarea
                value={item.aiRole}
                aria-label={`${item.area}: ${t("aiRole")}`}
                onChange={(event) =>
                  setBlueprint((current) => ({
                    ...current,
                    ownership: updateOwnership(current.ownership, item.id, "aiRole", event.target.value),
                  }))
                }
              />
              <textarea
                value={item.approval}
                aria-label={`${item.area}: ${t("approval")}`}
                onChange={(event) =>
                  setBlueprint((current) => ({
                    ...current,
                    ownership: updateOwnership(current.ownership, item.id, "approval", event.target.value),
                  }))
                }
              />
            </div>
          ))}
        </div>
      </section>

      <section className="inspector-section">
        <PanelHeader title={t("canvasOwnership")} detail={t("mappedNodes", { count: blueprint.nodes.length })} />
        {blueprint.nodes.length ? (
          <div className="canvas-owner-list">
            {blueprint.nodes.map((node) => (
              <div key={node.id}>
                <strong>{node.title}</strong>
                <span>{localizedNodeKinds.find((kind) => kind.id === node.kind)?.label} · {node.owner}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted-copy">{t("canvasOwnershipEmpty")}</p>
        )}
      </section>
    </div>
  );
}

function downloadTextFile(filename: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function AlternativesPanel({
  blueprint,
  onCreate,
  onAdopt,
  adoptedAlternativeId,
}: {
  blueprint: BlueprintFile;
  onCreate: (kind: AlternativeKind) => void;
  onAdopt: (alternative: BlueprintAlternative) => void;
  adoptedAlternativeId: string | null;
}) {
  const { locale, t } = useStudioTranslation();
  const options: Array<{ kind: AlternativeKind; label: string }> = [
    { kind: "privacy", label: t("privacyAlternative") },
    { kind: "review", label: t("reviewAlternative") },
    { kind: "small-team", label: t("smallTeamAlternative") },
  ];

  const labels = {
    sensitivity: { public: t("public"), internal: t("internal"), sensitive: t("sensitive") },
    automation: { assistive: t("assistive"), reviewed: t("reviewed"), automated: t("automated") },
    capacity: { solo: t("solo"), "small-team": t("smallTeam"), "technical-team": t("technicalTeam") },
  };

  return (
    <div className="inspector-scroll">
      <section className="inspector-section alternatives-panel">
        <PanelHeader title={t("alternatives")} detail={t("alternativesSummary", { count: blueprint.alternatives.length })} />
        <p className="alternatives-intro">{t("alternativesIntro")}</p>
        <div className="alternative-create-grid" aria-label={t("createAlternative")}>
          {options.map((option) => (
            <button key={option.kind} onClick={() => onCreate(option.kind)} type="button">
              <GitBranch size={15} />
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {adoptedAlternativeId ? (
        <p className="alternative-adopted" role="status"><Check size={15} /> {t("alternativeAdopted")}</p>
      ) : null}

      {blueprint.alternatives.length === 0 ? (
        <section className="inspector-section"><p className="muted-copy">{t("noAlternatives")}</p></section>
      ) : (
        <div className="alternative-list">
          {blueprint.alternatives.map((alternative) => {
            const snapshot = alternative.snapshot;
            const requiredGates = snapshot.gates.filter((gate) => gate.required).length;
            const differences = [
              blueprint.sensitivity !== snapshot.sensitivity ? `${t("sensitivity")}: ${labels.sensitivity[blueprint.sensitivity]} → ${labels.sensitivity[snapshot.sensitivity]}` : null,
              blueprint.automationLevel !== snapshot.automationLevel ? `${t("automation")}: ${labels.automation[blueprint.automationLevel]} → ${labels.automation[snapshot.automationLevel]}` : null,
              blueprint.teamCapacity !== snapshot.teamCapacity ? `${t("capacity")}: ${labels.capacity[blueprint.teamCapacity]} → ${labels.capacity[snapshot.teamCapacity]}` : null,
            ].filter(Boolean);
            return (
              <article className="alternative-card" key={alternative.id}>
                <div className="alternative-card-head">
                  <span><GitBranch size={16} /><strong>{alternative.title}</strong></span>
                  <small>{formatCalendarDate(alternative.createdAt, locale)}</small>
                </div>
                <p>{alternative.summary}</p>
                <div className="alternative-metric">{t("alternativeNodes", { nodes: snapshot.nodes.length, edges: snapshot.edges.length, gates: requiredGates })}</div>
                <div className="alternative-copy-block">
                  <strong>{t("alternativeRationale")}</strong>
                  <ul>{alternative.rationale.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                <div className="alternative-copy-block">
                  <strong>{t("alternativeChanges")}</strong>
                  <ul>{alternative.changes.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
                {differences.length ? (
                  <div className="alternative-copy-block alternative-comparison">
                    <strong>{t("compareCurrent")}</strong>
                    <ul>{differences.map((item) => <li key={item}>{item}</li>)}</ul>
                  </div>
                ) : null}
                <button className="primary-button alternative-adopt-button" onClick={() => onAdopt(alternative)} type="button">
                  {t("adoptAlternative")}
                  <ArrowRight size={15} />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function copyTextSafely(text: string) {
  void navigator.clipboard?.writeText(text).catch(() => undefined);
}

function PromptPanel({ blueprint, prompts }: { blueprint: BlueprintFile; prompts: PromptPackItem[] }) {
  const { locale, t } = useStudioTranslation();
  const promptMarkdown = formatPromptPackAsMarkdown(blueprint, prompts, locale);
  const warningCount = prompts.reduce(
    (total, prompt) => total + prompt.checks.filter((check) => check.status === "warning").length,
    0,
  );

  function copyAllPrompts() {
    copyTextSafely(promptMarkdown);
  }

  function exportPromptPack() {
    downloadTextFile(`hitm-prompt-pack-${projectFilenameStem(blueprint.projectName)}.md`, promptMarkdown);
  }

  return (
    <div className="inspector-scroll">
      <section className="inspector-section">
        <PanelHeader title={t("promptPack")} detail={t("promptSummary", { count: prompts.length, warnings: warningCount })} />
        <div className="prompt-pack-actions">
          <button onClick={copyAllPrompts}>
            <Copy size={15} />
            {t("copyPack")}
          </button>
          <button onClick={exportPromptPack}>
            <Download size={15} />
            {t("exportMarkdown")}
          </button>
        </div>
        <p className="prompt-pack-note">
          {t("promptPackNote")}
        </p>
        <div className="prompt-list">
          {prompts.map((item) => (
            <article className="prompt-card" key={item.id}>
              <div className="prompt-card-head">
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.owner}</small>
                </span>
                <button title={t("copy", { value: item.title })} onClick={() => copyTextSafely(item.prompt)}>
                  <Copy size={15} />
                </button>
              </div>
              <dl className="prompt-meta">
                <div>
                  <dt>{t("purpose")}</dt>
                  <dd>{item.purpose}</dd>
                </div>
                <div>
                  <dt>{t("whenToUse")}</dt>
                  <dd>{item.whenToUse}</dd>
                </div>
                <div>
                  <dt>{t("output")}</dt>
                  <dd>{item.output}</dd>
                </div>
              </dl>
              <p>{item.prompt}</p>
              <div className="prompt-checks" aria-label={`${item.title} checks`}>
                {item.checks.map((check) => (
                  <span className={cx("prompt-check", check.status === "pass" ? "is-pass" : "is-warning")} key={check.id} title={check.detail}>
                    {check.status === "pass" ? <Check size={13} /> : <AlertTriangle size={13} />}
                    {check.label}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ReportPanel({
  blueprint,
  report,
  reportMarkdown,
  warnings,
}: {
  blueprint: BlueprintFile;
  report: ReturnType<typeof buildReport>;
  reportMarkdown: string;
  warnings: HitmWarning[];
}) {
  const { locale, t } = useStudioTranslation();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const completion = getCompletionScore(blueprint);
  const requiredGateCount = blueprint.gates.filter((gate) => gate.required).length;
  const handoffReady = completion === 100 && report.openWarningCount === 0 && blueprint.nodes.length > 0;

  function exportReportMarkdown() {
    downloadTextFile(`hitm-blueprint-report-${projectFilenameStem(blueprint.projectName)}.md`, reportMarkdown);
  }

  async function copyReportMarkdown() {
    try {
      await navigator.clipboard.writeText(reportMarkdown);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div className="inspector-scroll">
      <section className="report-document">
        <div className="report-head">
          <span>{t("finalReport")}</span>
          <h2>{report.projectName}</h2>
          <p>{completionMessage(blueprint, locale)}</p>
          <div className="report-actions">
            <button onClick={copyReportMarkdown} type="button">
              <Copy size={15} />
              {copyState === "copied" ? t("copied") : t("copyReport")}
            </button>
            <button onClick={exportReportMarkdown}>
              <Download size={15} />
              {t("exportMarkdown")}
            </button>
            <button onClick={() => window.print()}>
              <Printer size={15} />
              {t("print")}
            </button>
          </div>
          {copyState !== "idle" ? <span className={cx("report-copy-status", copyState === "failed" && "is-problem")} role="status">{copyState === "copied" ? t("reportCopied") : t("copyUnavailable")}</span> : null}
          <div className="report-readiness" aria-label={t("handoffReadiness")}>
            <div className={cx("report-readiness-status", handoffReady && "is-ready")}>
              <span>{t("handoffStatus")}</span>
              <strong>{handoffReady ? t("readyToShare") : t("reviewNeeded")}</strong>
              <small>{t("complete", { count: completion })}</small>
            </div>
            <div>
              <span>{t("workflow")}</span>
              <strong>{t("connections", { nodes: blueprint.nodes.length, edges: blueprint.edges.length })}</strong>
            </div>
            <div>
              <span>{t("checks")}</span>
              <strong>{report.openWarningCount === 0 ? t("noOpenWarnings") : t("needReview", { count: report.openWarningCount })}</strong>
            </div>
            <div>
              <span>{t("setGovernance")}</span>
              <strong>{t("requiredGates", { count: requiredGateCount })}</strong>
            </div>
          </div>
        </div>

        <div className="report-block">
          <h3>{t("projectSummary")}</h3>
          <p>{report.summary}</p>
          <dl>
            <div>
              <dt>{t("audience")}</dt>
              <dd>{report.audience}</dd>
            </div>
            <div>
              <dt>{t("stackPattern")}</dt>
              <dd>{report.selectedPattern}</dd>
            </div>
            <div>
              <dt>{t("sensitivity")}</dt>
              <dd>{report.sensitivity}</dd>
            </div>
            <div>
              <dt>{t("automation")}</dt>
              <dd>{report.automationLevel}</dd>
            </div>
          </dl>
        </div>

        <div className="report-block">
          <h3>{t("projectBoundaries")}</h3>
          <dl>
            <div>
              <dt>{t("whatAiDo")}</dt>
              <dd>{report.aiAssistance}</dd>
            </div>
            <div>
              <dt>{t("humanControl")}</dt>
              <dd>{report.humanControl}</dd>
            </div>
            <div>
              <dt>{t("sourceMaterial")}</dt>
              <dd>{report.sourceMaterial}</dd>
            </div>
            <div>
              <dt>{t("successMeasures")}</dt>
              <dd>{report.successMeasures}</dd>
            </div>
            <div>
              <dt>{t("scopeIn")}</dt>
              <dd>{report.scopeIn}</dd>
            </div>
            <div>
              <dt>{t("scopeOut")}</dt>
              <dd>{report.scopeOut}</dd>
            </div>
          </dl>
        </div>

        <div className="report-block">
          <h3>{t("ownershipMatrix")}</h3>
          <div className="report-table">
            <div className="report-table-head">
              <span>{t("area")}</span>
              <span>{t("humanOwner")}</span>
              <span>{t("aiRole")}</span>
              <span>{t("approval")}</span>
            </div>
            {report.ownershipDetails.map((item) => (
              <div className="report-table-row" key={item.area}>
                <span>{item.area}</span>
                <span>{item.humanOwner}</span>
                <span>{item.aiRole}</span>
                <span>{item.approval}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-block">
          <h3>{t("governanceGates")}</h3>
          <div className="report-card-grid">
            {report.gateDetails.map((gate) => (
              <article className="report-mini-card" key={gate.label}>
                <strong>{gate.label}</strong>
                <span>{gate.required ? t("required") : t("optional")} · {gate.owner}</span>
                <p>{gate.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="report-block">
          <h3>{t("workflowBlueprint")}</h3>
          {report.canvasNodeDetails.length ? (
            <ol className="report-workflow-list">
              {report.canvasNodeDetails.map((node) => (
                <li key={`${node.title}-${node.owner}`}>
                  <strong>{node.title}</strong>
                  <span>{node.kind} · {node.owner}</span>
                  <p>{node.detail}</p>
                  {node.dataApproval ? <p>{t("dataApproval")}: {node.dataApproval}</p> : null}
                  {node.explicitStop ? <p>{t("explicitStop")}</p> : null}
                </li>
              ))}
            </ol>
          ) : (
            <p>{t("noNodesMapped")}</p>
          )}
        </div>

        <div className="report-block">
          <h3>{t("workflowConnections")}</h3>
          <ul>
            {report.canvasEdges.map((edge) => (
              <li key={edge}>{edge}</li>
            ))}
          </ul>
        </div>

        <div className="report-block">
          <h3>{t("stackGuide")}</h3>
          <p><strong>{report.selectedPattern}</strong></p>
          <ul>
            <li>{t("fit")}: {report.stackFit}</li>
            <li>{t("provides")}: {report.stackGives}</li>
            <li>{t("tradeoff")}: {report.stackTradeoff}</li>
            <li>{t("review")}: {report.stackReview}</li>
            <li>{t("avoid")}: {report.stackAvoid}</li>
          </ul>
        </div>

        <div className="report-block">
          <h3>{t("warningStatus")}</h3>
          <p>{t("warningSummary", { open: report.openWarningCount, exceptions: report.exceptionCount })}</p>
          <ul>
            {warnings.length ? warnings.slice(0, 8).map((warning) => (
              <li key={warning.id}>{warning.title}: {t(warning.status === "exception" ? "exceptions" : warning.status)}{warning.note ? ` — ${warning.note}` : ""}</li>
            )) : <li>{t("noWarnings")}</li>}
          </ul>
        </div>

        <div className="report-block">
          <h3>{t("promptPack")}</h3>
          <div className="report-card-grid">
            {report.promptDetails.map((prompt) => (
              <article className="report-mini-card" key={prompt.title}>
                <strong>{prompt.title}</strong>
                <span>{prompt.owner}</span>
                <p>{prompt.purpose}</p>
                <em>{t("checkWarnings", { count: prompt.checkWarningCount })}</em>
              </article>
            ))}
          </div>
        </div>

        <div className="report-block">
          <h3>{t("nextSteps")}</h3>
          <ol>
            {report.nextSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="report-block report-services">
          <h3>{t("optionalSupport")}</h3>
          <p>{report.servicesNote}</p>
        </div>
      </section>
    </div>
  );
}
