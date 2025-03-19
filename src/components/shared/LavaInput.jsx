export const LavaInput = ({
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter text',
  error,
  type = 'text',
  required = false,
  maxLength,
}) => (
  <>
    {label ? (
      <div className="uppercase text-[20px] font-bold">
        {required ? '*' : ''}{label}
      </div>
    ) : null}
    <div className="mt-4">
      <input
        className="
          rounded-[10px] bg-input-bg py-4 pl-5 pr-5 text-lg font-medium w-full border border-dark-600 h-[60px]
          focus:outline-none focus:ring-[1px] focus:ring-white focus:border-white transition-all duration-200
        "
        maxLength={maxLength}
        name={name}
        placeholder={placeholder}
        type={type}
        value={value || ''}
        onChange={onChange}
      />
      {error && (
        <p className="text-main-red mt-1">
          {error}
        </p>
      )}
    </div>
  </>
);
