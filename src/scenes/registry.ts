import type React from 'react';
import type {SceneProps} from '../core/types';
import type {SceneName} from './schemas';
import {TitleScene} from './TitleScene';
import {FeatureGrid} from './FeatureGrid';
import {MetricScene} from './MetricScene';
import {AlertCallout} from './AlertCallout';
import {ThreeStage} from './ThreeStage';
import {CtaScene} from './CtaScene';
import {RobotDashboard, AnomalyAlert} from './FleetDashboard';
import {NightSite, RouteMap, LogoEndCard} from './VeronScenes';
import {FleetOverhead, OversightConsolidation, AuditTrail, ScaleFinale} from './AuditScenes';
import {BeforeAfter, CursorDemo, DeviceMockup} from './MediaScenes';
import {Chart} from './Chart';
import {IconGrid, LogoReveal, Quote, StepFlow, Timeline} from './ContentScenes';

// To add a scene: create the component, add its schema to schemas.ts, then register it here.
// The type below makes the build fail if a schema has no scene, or a scene has no schema.
export const registry: Record<SceneName, React.FC<SceneProps>> = {
  title: TitleScene,
  featureGrid: FeatureGrid,
  metric: MetricScene,
  stepFlow: StepFlow,
  alert: AlertCallout,
  threeStage: ThreeStage,
  cta: CtaScene,
  deviceMockup: DeviceMockup,
  cursorDemo: CursorDemo,
  beforeAfter: BeforeAfter,
  chart: Chart,
  quote: Quote,
  timeline: Timeline,
  logoReveal: LogoReveal,
  iconGrid: IconGrid,
  robotDashboard: RobotDashboard,
  anomalyAlert: AnomalyAlert,
  nightSite: NightSite,
  routeMap: RouteMap,
  logoEndCard: LogoEndCard,
  fleetOverhead: FleetOverhead,
  oversightConsolidation: OversightConsolidation,
  auditTrail: AuditTrail,
  scaleFinale: ScaleFinale,
};
