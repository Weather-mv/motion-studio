import type React from 'react';
import type {SceneProps} from '../core/types';
import {TitleScene} from './TitleScene';
import {FeatureGrid} from './FeatureGrid';
import {MetricScene} from './MetricScene';
import {StepFlow} from './StepFlow';
import {AlertCallout} from './AlertCallout';
import {ThreeStage} from './ThreeStage';
import {CtaScene} from './CtaScene';
import {RobotDashboard, AnomalyAlert} from './FleetDashboard';
import {NightSite, RouteMap, LogoEndCard} from './VeronScenes';

// To add a scene: create the component, then register it here and list it in tools/check-job.mjs SCENES.
export const registry: Record<string, React.FC<SceneProps>> = {
  title: TitleScene,
  featureGrid: FeatureGrid,
  metric: MetricScene,
  stepFlow: StepFlow,
  alert: AlertCallout,
  threeStage: ThreeStage,
  cta: CtaScene,
  robotDashboard: RobotDashboard,
  anomalyAlert: AnomalyAlert,
  nightSite: NightSite,
  routeMap: RouteMap,
  logoEndCard: LogoEndCard
};
