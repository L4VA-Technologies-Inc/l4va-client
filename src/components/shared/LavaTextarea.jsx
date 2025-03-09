export const LavaTextarea = ({
  name,
  label,
  value,
  onChange,
  placeholder = 'Enter text',
  error,
  required = false,
  minHeight = 'min-h-32',
  className = '',
}) => (
  <>
    {label ? (
      <div className="uppercase text-[20px] font-bold">
        {required ? '*' : ''}{label}
      </div>
    ) : null}
    <div className="mt-4">
      <textarea
        className={`
          resize-none py-4 pl-5 pr-5 text-lg font-medium w-full border border-dark-600 bg-input-bg rounded-[10px] ${minHeight}
          ${error ? 'border-main-red' : ''}
          ${className}
        `}
        name={name}
        placeholder={placeholder}
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
