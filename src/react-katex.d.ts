declare module 'react-katex' {
  import type { FC } from 'react';
  type KatexProps = {
    math: string;
    errorColor?: string;
    renderError?: (error: Error) => React.ReactNode;
    settings?: Record<string, unknown>;
  };
  export const InlineMath: FC<KatexProps>;
  export const BlockMath: FC<KatexProps>;
}
