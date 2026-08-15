"use client";

export default function MovingClouds() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1, width: "100vw", height: "100vh" }}
      aria-hidden="true"
    >
      {/* Cloud 1 — small, fast, foreground */}
      <div className="cloud cloud-1">
        <svg viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur1">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>
          <g filter="url(#cloudBlur1)">
            <circle cx="30" cy="30" r="18" fill="#79BFD6" />
            <circle cx="55" cy="25" r="22" fill="#79BFD6" />
            <circle cx="75" cy="30" r="16" fill="#79BFD6" />
          </g>
        </svg>
      </div>

      {/* Cloud 2 — medium, medium speed */}
      <div className="cloud cloud-2">
        <svg viewBox="0 0 140 60" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur2">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <g filter="url(#cloudBlur2)">
            <circle cx="35" cy="38" r="22" fill="#79BFD6" />
            <circle cx="70" cy="30" r="28" fill="#79BFD6" />
            <circle cx="105" cy="38" r="20" fill="#79BFD6" />
            <circle cx="55" cy="25" r="18" fill="#79BFD6" />
          </g>
        </svg>
      </div>

      {/* Cloud 3 — large, slow, background */}
      <div className="cloud cloud-3">
        <svg viewBox="0 0 200 80" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur3">
              <feGaussianBlur stdDeviation="2.5" />
            </filter>
          </defs>
          <g filter="url(#cloudBlur3)">
            <circle cx="50" cy="50" r="28" fill="#79BFD6" />
            <circle cx="95" cy="40" r="38" fill="#79BFD6" />
            <circle cx="145" cy="50" r="26" fill="#79BFD6" />
            <circle cx="75" cy="32" r="22" fill="#79BFD6" />
          </g>
        </svg>
      </div>

      {/* Cloud 4 — small, fast */}
      <div className="cloud cloud-4">
        <svg viewBox="0 0 90 45" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur4">
              <feGaussianBlur stdDeviation="1.5" />
            </filter>
          </defs>
          <g filter="url(#cloudBlur4)">
            <circle cx="25" cy="28" r="16" fill="#79BFD6" />
            <circle cx="50" cy="22" r="20" fill="#79BFD6" />
            <circle cx="70" cy="28" r="14" fill="#79BFD6" />
          </g>
        </svg>
      </div>

      {/* Cloud 5 — medium-large, slowest */}
      <div className="cloud cloud-5">
        <svg viewBox="0 0 170 70" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="cloudBlur5">
              <feGaussianBlur stdDeviation="2" />
            </filter>
          </defs>
          <g filter="url(#cloudBlur5)">
            <circle cx="40" cy="42" r="24" fill="#79BFD6" />
            <circle cx="85" cy="35" r="32" fill="#79BFD6" />
            <circle cx="130" cy="42" r="22" fill="#79BFD6" />
            <circle cx="65" cy="28" r="20" fill="#79BFD6" />
          </g>
        </svg>
      </div>
    </div>
  );
}
