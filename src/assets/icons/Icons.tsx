interface IconProps {
  width?: number;
  height?: number;
  color?: string;
}

export const GithubIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      aria-label="GitHub icon"
      role="img"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M16 22.0268V19.1568C16.0375 18.68 15.9731 18.2006 15.811 17.7506C15.6489 17.3006 15.3929 16.8902 15.06 16.5468C18.2 16.1968 21.5 15.0068 21.5 9.54679C21.4997 8.15062 20.9627 6.80799 20 5.79679C20.4558 4.5753 20.4236 3.22514 19.91 2.02679C19.91 2.02679 18.73 1.67679 16 3.50679C13.708 2.88561 11.292 2.88561 8.99999 3.50679C6.26999 1.67679 5.08999 2.02679 5.08999 2.02679C4.57636 3.22514 4.54413 4.5753 4.99999 5.79679C4.03011 6.81549 3.49251 8.17026 3.49999 9.57679C3.49999 14.9968 6.79998 16.1868 9.93998 16.5768C9.61098 16.9168 9.35725 17.3222 9.19529 17.7667C9.03334 18.2112 8.96679 18.6849 8.99999 19.1568V22.0268"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20.0267C6 20.9999 3.5 20.0267 2 17.0267"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const LinkedInIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
    >
      <path
        d="M21 8V16C21 18.7614 18.7614 21 16 21H8C5.23858 21 3 18.7614 3 16V8C3 5.23858 5.23858 3 8 3H16C18.7614 3 21 5.23858 21 8Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M7 17V13.5V10"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M11 17V13.75M11 10V13.75M11 13.75C11 10 17 10 17 13.75V17"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M7 7.01L7.01 6.99889"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export const TwitterIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      aria-label="Twitter icon"
      role="img"
      strokeLinecap="round"
    >
      <path
        d="M16.8198 20.7684L3.75317 3.96836C3.44664 3.57425 3.72749 3 4.22678 3H6.70655C6.8917 3 7.06649 3.08548 7.18016 3.23164L20.2468 20.0316C20.5534 20.4258 20.2725 21 19.7732 21H17.2935C17.1083 21 16.9335 20.9145 16.8198 20.7684Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M20 3L4 21"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const MoonIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      width={width}
      height={height}
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color={color}
      aria-label="Moon icon"
      role="img"
    >
      <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"></circle>
      <path
        d="M7.63262 3.06689C8.98567 3.35733 9.99999 4.56025 9.99999 6.00007C9.99999 7.65693 8.65685 9.00007 6.99999 9.00007C5.4512 9.00007 4.17653 7.82641 4.01685 6.31997"
        stroke={color}
        strokeWidth="1.5"
      ></path>
      <path
        d="M22 13.0505C21.3647 12.4022 20.4793 12 19.5 12C17.567 12 16 13.567 16 15.5C16 17.2632 17.3039 18.7219 19 18.9646"
        stroke={color}
        strokeWidth="1.5"
      ></path>
      <path
        d="M14.5 8.51L14.51 8.49889"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
      <path
        d="M10 17C11.1046 17 12 16.1046 12 15C12 13.8954 11.1046 13 10 13C8.89543 13 8 13.8954 8 15C8 16.1046 8.89543 17 10 17Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      ></path>
    </svg>
  );
};

export const SunIcon: React.FC<IconProps> = ({
  width = 24,
  height = 24,
  color = "currentColor",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-label="Sun icon"
      role="img"
    >
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    </svg>
  );
};

export const FacebookIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <linearGradient
        id="Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1"
        x1="9.993"
        x2="40.615"
        y1="9.993"
        y2="40.615"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0" stopColor="#2aa4f4"></stop>
        <stop offset="1" stopColor="#007ad9"></stop>
      </linearGradient>
      <path
        fill="url(#Ld6sqrtcxMyckEl6xeDdMa_uLWV5A9vXIPu_gr1)"
        d="M24,4C12.954,4,4,12.954,4,24s8.954,20,20,20s20-8.954,20-20S35.046,4,24,4z"
      ></path>
      <path
        fill="#fff"
        d="M26.707,29.301h5.176l0.813-5.258h-5.989v-2.874c0-2.184,0.714-4.121,2.757-4.121h3.283V12.46 c-0.577-0.078-1.797-0.248-4.102-0.248c-4.814,0-7.636,2.542-7.636,8.334v3.498H16.06v5.258h4.948v14.452 C21.988,43.9,22.981,44,24,44c0.921,0,1.82-0.084,2.707-0.204V29.301z"
      ></path>
    </svg>
  );
};

export const GoogleIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <path
        fill="#fbc02d"
        d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
      <path
        fill="#e53935"
        d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
      ></path>
      <path
        fill="#4caf50"
        d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
      ></path>
      <path
        fill="#1565c0"
        d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571	c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
      ></path>
    </svg>
  );
};

export const MicrosoftIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="48"
      height="48"
      viewBox="0 0 48 48"
    >
      <defs>
        <linearGradient
          id="K7_evwOeO6UmBZr1zxGzda_YJfJ0JM5Imsj_gr1"
          x1="6"
          x2="22"
          y1="14"
          y2="14"
          data-name="ÐÐµÐ·ÑÐ¼ÑÐ½Ð½ÑÐ¹ Ð³ÑÐ°Ð´Ð¸ÐµÐ½Ñ 16"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#f44f5a"></stop>
          <stop offset=".44" stopColor="#ee3d4a"></stop>
          <stop offset="1" stopColor="#e52030"></stop>
        </linearGradient>
        <linearGradient
          id="K7_evwOeO6UmBZr1zxGzdb_YJfJ0JM5Imsj_gr2"
          x1="56.6"
          x2="23.63"
          y1="14"
          y2="14"
          data-name="ÐÐµÐ·ÑÐ¼ÑÐ½Ð½ÑÐ¹ Ð³ÑÐ°Ð´Ð¸ÐµÐ½Ñ 10"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#21ad64"></stop>
          <stop offset="1" stopColor="#088242"></stop>
        </linearGradient>
        <linearGradient
          id="K7_evwOeO6UmBZr1zxGzdc_YJfJ0JM5Imsj_gr3"
          x1="48.68"
          x2="20.72"
          y1="34"
          y2="34"
          data-name="ÐÐµÐ·ÑÐ¼ÑÐ½Ð½ÑÐ¹ Ð³ÑÐ°Ð´Ð¸ÐµÐ½Ñ 11"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fede00"></stop>
          <stop offset="1" stopColor="#ffd000"></stop>
        </linearGradient>
        <linearGradient
          id="K7_evwOeO6UmBZr1zxGzdd_YJfJ0JM5Imsj_gr4"
          x1="6"
          x2="22"
          y1="34"
          y2="34"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#33bef0"></stop>
          <stop offset="1" stopColor="#22a5e2"></stop>
        </linearGradient>
      </defs>
      <path
        fill="url(#K7_evwOeO6UmBZr1zxGzda_YJfJ0JM5Imsj_gr1)"
        d="m22,22H6V6h16v16Z"
      ></path>
      <path
        fill="url(#K7_evwOeO6UmBZr1zxGzdb_YJfJ0JM5Imsj_gr2)"
        d="m42,22h-16V6h16v16Z"
      ></path>
      <path
        fill="url(#K7_evwOeO6UmBZr1zxGzdc_YJfJ0JM5Imsj_gr3)"
        d="m42,42h-16v-16h16v16Z"
      ></path>
      <path
        fill="url(#K7_evwOeO6UmBZr1zxGzdd_YJfJ0JM5Imsj_gr4)"
        d="m22,42H6v-16h16v16Z"
      ></path>
    </svg>
  );
};

export const ButtonSpinnerIcon: React.FC = () => {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="button-spinner"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </svg>
  );
};

export const SuccessIcon: React.FC = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="success-icon"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
};
