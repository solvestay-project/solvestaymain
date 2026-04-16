declare module "react-responsive-masonry" {
  import type * as React from "react";

  export type Breakpoints<T> = Record<number, T>;

  export interface ResponsiveMasonryProps {
    children?: React.ReactNode;
    columnsCountBreakPoints?: Breakpoints<number>;
    gutterBreakPoints?: Breakpoints<string | number>;
    className?: string;
    style?: React.CSSProperties;
  }

  export const ResponsiveMasonry: React.ComponentType<ResponsiveMasonryProps>;

  export interface MasonryProps {
    children?: React.ReactNode;
    sequential?: boolean;
    className?: string;
    style?: React.CSSProperties;
  }

  const Masonry: React.ComponentType<MasonryProps>;
  export default Masonry;
}

