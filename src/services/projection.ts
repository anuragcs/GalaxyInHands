import type { LookDirection, ScreenPoint } from '@/data/types';
import { wrap180 } from '@/lib/format';

const DEFAULT_HFOV = 62;

export function verticalFov(width: number, height: number, hfov = DEFAULT_HFOV): number {
  const aspect = height / Math.max(width, 1);
  return (2 * Math.atan(Math.tan((hfov * Math.PI) / 360) * aspect) * 180) / Math.PI;
}

export function angularDistance(az1: number, el1: number, az2: number, el2: number): number {
  const a1 = (az1 * Math.PI) / 180;
  const a2 = (az2 * Math.PI) / 180;
  const e1 = (el1 * Math.PI) / 180;
  const e2 = (el2 * Math.PI) / 180;
  const cos =
    Math.sin(e1) * Math.sin(e2) +
    Math.cos(e1) * Math.cos(e2) * Math.cos(a1 - a2);
  return (Math.acos(Math.min(1, Math.max(-1, cos))) * 180) / Math.PI;
}

export function projectToScreen(
  objectAz: number,
  objectEl: number,
  look: LookDirection,
  width: number,
  height: number,
  hfov = DEFAULT_HFOV,
): ScreenPoint {
  const vfov = verticalFov(width, height, hfov);
  let dx = wrap180(objectAz - look.heading);
  let dy = objectEl - look.pitch;

  const rollRad = (-look.roll * Math.PI) / 180;
  const cosR = Math.cos(rollRad);
  const sinR = Math.sin(rollRad);
  const rdx = dx * cosR - dy * sinR;
  const rdy = dx * sinR + dy * cosR;
  dx = rdx;
  dy = rdy;

  const x = width / 2 + (dx / (hfov / 2)) * (width / 2);
  const y = height / 2 - (dy / (vfov / 2)) * (height / 2);
  const pad = 36;
  const visible =
    x >= -pad &&
    x <= width + pad &&
    y >= -pad &&
    y <= height + pad &&
    Math.abs(dx) <= hfov * 0.7 &&
    Math.abs(dy) <= vfov * 0.7;

  return { x, y, visible };
}
