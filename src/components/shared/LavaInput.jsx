export const LavaInput = ({
  label,
  value,
  onChange,
  placeholder = 'Input',
  error,
  type = 'text',
  required = false,
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
          bg-input-bg py-4 pl-5 pr-5 text-lg font-medium w-full focus:outline-none border border-dark-600 h-[60px]
        "
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
