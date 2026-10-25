import type { ComponentType } from 'react';

import type { DiagramKey } from '@/types';
import {
  AccessControlDiagram,
  AuthenticationDiagram,
  CryptoDiagram,
  ExceptionsDiagram,
  InsecureDesignDiagram,
  InjectionDiagram,
  IntegrityDiagram,
  LoggingDiagram,
  MisconfigurationDiagram,
  SupplyChainDiagram,
  type DiagramProps,
} from './illustrations';

const MAP: Record<DiagramKey, ComponentType<DiagramProps>> = {
  'access-control': AccessControlDiagram,
  misconfiguration: MisconfigurationDiagram,
  'supply-chain': SupplyChainDiagram,
  crypto: CryptoDiagram,
  injection: InjectionDiagram,
  'insecure-design': InsecureDesignDiagram,
  authentication: AuthenticationDiagram,
  integrity: IntegrityDiagram,
  logging: LoggingDiagram,
  exceptions: ExceptionsDiagram,
};

interface LessonDiagramProps {
  name: DiagramKey;
  title: string;
  description?: string;
  className?: string;
}

/** Resolves a `DiagramKey` from lesson data to the matching inline SVG. */
export function LessonDiagram({ name, title, description, className }: LessonDiagramProps) {
  const Component = MAP[name];
  return <Component title={title} description={description} className={className} />;
}
