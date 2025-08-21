// Paddle v2 SDK global types
import { PaddleStatic } from './paddle';

declare global {
  interface Window {
    Paddle: PaddleStatic;
  }
}

export {};
