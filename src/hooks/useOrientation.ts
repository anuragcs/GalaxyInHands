import { useEffect, useRef, useState } from 'react';
import { DeviceMotion, Magnetometer } from 'expo-sensors';
import type { LookDirection } from '@/data/types';
import { wrap180, wrap360 } from '@/lib/format';

type Vec = { x: number; y: number; z: number };

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpAngle(current: number, next: number, t: number): number {
  return wrap360(current + wrap180(next - current) * t);
}

function lerpVec(current: Vec, next: Vec, t: number): Vec {
  return {
    x: lerp(current.x, next.x, t),
    y: lerp(current.y, next.y, t),
    z: lerp(current.z, next.z, t),
  };
}

function tiltCompensatedHeading(mag: Vec, acc: Vec): number {
  const gNorm = Math.hypot(acc.x, acc.y, acc.z) || 1;
  const gx = acc.x / gNorm;
  const gy = acc.y / gNorm;
  const gz = acc.z / gNorm;

  const pitch = Math.atan2(-gz, -gy);
  const roll = Math.atan2(gx, Math.hypot(gy, gz));

  const cosP = Math.cos(pitch);
  const sinP = Math.sin(pitch);
  const cosR = Math.cos(roll);
  const sinR = Math.sin(roll);

  const xh = mag.x * cosR + mag.z * sinR;
  const yh = mag.x * sinP * sinR + mag.y * cosP - mag.z * sinP * cosR;
  return wrap360((Math.atan2(-xh, yh) * 180) / Math.PI);
}

function pitchFromGravity(acc: Vec): number {
  return (Math.atan2(-acc.z, -acc.y) * 180) / Math.PI;
}

function rollFromGravity(acc: Vec): number {
  return (Math.atan2(acc.x, Math.hypot(acc.y, acc.z)) * 180) / Math.PI;
}

export function useOrientation(compassOffset: number) {
  const [look, setLook] = useState<LookDirection>({ heading: 0, pitch: 0, roll: 0 });
  const magRaw = useRef<Vec>({ x: 0, y: 0, z: 0 });
  const magSmooth = useRef<Vec>({ x: 0, y: 0, z: 0 });
  const accSmooth = useRef<Vec>({ x: 0, y: -1, z: 0 });
  const lookRef = useRef<LookDirection>({ heading: 0, pitch: 0, roll: 0 });
  const lastEmit = useRef(0);
  const primed = useRef(false);

  useEffect(() => {
    let mounted = true;
    primed.current = false;

    async function start() {
      await DeviceMotion.requestPermissionsAsync();
      DeviceMotion.setUpdateInterval(40);
      Magnetometer.setUpdateInterval(50);

      const magSub = Magnetometer.addListener((data) => {
        magRaw.current = data;
        magSmooth.current = primed.current ? lerpVec(magSmooth.current, data, 0.18) : data;
      });

      const motionSub = DeviceMotion.addListener((motion) => {
        if (!mounted) return;
        const acc = motion.accelerationIncludingGravity;
        if (!acc) return;

        accSmooth.current = primed.current ? lerpVec(accSmooth.current, acc, 0.2) : acc;
        if (!primed.current) {
          magSmooth.current = magRaw.current;
          primed.current = true;
        }

        const rawHeading = wrap360(tiltCompensatedHeading(magSmooth.current, accSmooth.current) + compassOffset);
        const rawPitch = pitchFromGravity(accSmooth.current);
        const rawRoll = rollFromGravity(accSmooth.current);
        const prev = lookRef.current;
        const jump = Math.abs(wrap180(rawHeading - prev.heading));
        const headingT = jump > 20 ? 0.05 : 0.11;

        const next = {
          heading: lerpAngle(prev.heading, rawHeading, headingT),
          pitch: lerp(prev.pitch, rawPitch, 0.14),
          roll: lerp(prev.roll, rawRoll, 0.12),
        };
        lookRef.current = next;

        const now = Date.now();
        if (now - lastEmit.current >= 50) {
          lastEmit.current = now;
          setLook(next);
        }
      });

      return () => {
        magSub.remove();
        motionSub.remove();
      };
    }

    const cleanupPromise = start();
    return () => {
      mounted = false;
      void cleanupPromise.then((cleanup) => cleanup?.());
    };
  }, [compassOffset]);

  return look;
}
