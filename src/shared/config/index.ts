/**
 * Shared Configuration Exports
 * Central export point for all configuration files
 */

export {
  default as SENTINEL_CONSTITUTION,
  ConstitutionUtils,
  ValidationRules,
} from './constitution';

export {
  navigationConfig,
  getAllNavigationPaths,
  findNavigationItem,
} from './navigation';

export type {
  RiskZone,
  GradeScale,
  FindingSeverity,
  FindingStatus,
  WorkpaperState,
  ProbeType,
  ModuleName,
} from './constitution';

export type { NavigationItem } from './navigation';
