interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export function Logo({ className, width = 350, height = 299 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 350 299"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.10352e-05 172.169C6.10352e-05 117.428 14.4053 75.0482 43.2159 45.0289C72.0265 15.0096 116.187 0 175.697 0C229.54 0 272.048 12.8023 303.22 38.407C334.392 64.0117 349.978 102.86 349.978 154.952C349.978 202.63 336.517 238.388 309.596 262.227C283.147 286.508 248.905 298.648 206.869 298.648H144.525L144.525 68.8678C111.936 72.3994 89.5017 83.4359 77.2218 101.977C64.9419 120.519 58.8019 148.772 58.8019 186.738C58.8019 202.63 60.455 218.964 63.7611 235.74C67.0673 252.515 72.0265 286.287 77.2218 298.648H20.5452C13.933 284.521 8.26532 248.983 4.9592 230.442C1.65308 212.342 6.10352e-05 192.918 6.10352e-05 172.169ZM194.826 68.8678L194.826 235.077H218.205C241.348 235.077 259.295 229.118 272.047 217.198C285.272 205.279 291.884 185.192 291.884 156.939C291.884 123.388 284.091 100.211 268.505 87.4091C252.919 75.0482 228.359 68.8678 194.826 68.8678Z"
        fill="url(#paint0_linear_51_2)"
      />
      <path
        d="M194.821 234.664V68.4406C268.647 71.6466 291.861 91.0132 294.37 163.084C286.357 227.22 259.135 236.516 194.821 234.664Z"
        fill="url(#paint1_linear_51_2)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_51_2"
          x1="174.989"
          y1="0"
          x2="174.989"
          y2="298.648"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#CDACFF" />
          <stop offset="1" stopColor="#5FA1FF" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_51_2"
          x1="244.596"
          y1="68.4404"
          x2="244.596"
          y2="234.874"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FBCA21" />
          <stop offset="1" stopColor="#FDB385" />
        </linearGradient>
      </defs>
    </svg>
  )
}

