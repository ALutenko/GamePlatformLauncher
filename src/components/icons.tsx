import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const StoreIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9h18v3a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" />
    <path d="M5 14v6h14v-6" />
  </svg>
);

export const LibraryIcon = (p: Props) => (
  <svg {...base} {...p}>
    <rect x="3" y="4" width="4" height="16" rx="1" />
    <rect x="10" y="4" width="4" height="16" rx="1" />
    <path d="M17 5l4 1-3 14-4-1z" />
  </svg>
);

export const SearchIcon = (p: Props) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

export const PlayIcon = (p: Props) => (
  <svg {...base} fill="currentColor" stroke="none" {...p}>
    <path d="M7 4.5v15l12-7.5z" />
  </svg>
);

export const DownloadIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 20h16" />
  </svg>
);

export const LockIcon = (p: Props) => (
  <svg {...base} {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const ExternalIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
  </svg>
);

export const CloseIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const LogoutIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M10 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h5" />
    <path d="M15 8l5 4-5 4" />
    <path d="M20 12H9" />
  </svg>
);

export const CheckIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M5 12l4 4L19 6" />
  </svg>
);

export const UserIcon = (p: Props) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
