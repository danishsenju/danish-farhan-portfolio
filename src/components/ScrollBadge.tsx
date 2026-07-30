export default function ScrollBadge() {
  return (
    <div className="badge-rotate size-[92px]" aria-hidden>
      <svg viewBox="0 0 100 100" className="h-full w-full">
        <defs>
          <path
            id="badge-circle"
            d="M 50,50 m -37,0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          />
        </defs>
        <text
          fill="currentColor"
          fontSize="9.5"
          letterSpacing="2.6"
          fontWeight="400"
        >
          <textPath href="#badge-circle">
            SCROLL DOWN · SCROLL DOWN ·
          </textPath>
        </text>
      </svg>
    </div>
  );
}
