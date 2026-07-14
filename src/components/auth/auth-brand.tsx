/** Marca (logo + nome) exibida no topo das telas de login e cadastro. */
export function AuthBrand() {
  return (
    <div className="mb-6 flex flex-col items-center gap-2">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="M12 2v20M2 12h20M4.9 4.9l14.2 14.2M19.1 4.9L4.9 19.1" />
        </svg>
      </span>
      <span className="text-lg font-semibold tracking-tight">ERP HVAC</span>
    </div>
  );
}
