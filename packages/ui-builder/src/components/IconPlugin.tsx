interface IconPluginPropType {
  className?: string;
}

export default function IconPlugin({ className }: IconPluginPropType) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...{ className }}>
      <path
        d="M10.586 1.586A2 2 0 0 0 10 3v1a1 1 0 0 1-1 1H6a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H3a2 2 0 1 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1h-1a2 2 0 0 1 0-4h1a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-3a1 1 0 0 1-1-1V3a2 2 0 0 0-3.414-1.414Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
