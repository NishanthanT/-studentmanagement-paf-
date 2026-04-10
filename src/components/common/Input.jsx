import PropTypes from 'prop-types';

const Input = ({ label, id, error, ...props }) => {
  return (
    <div className="mb-6 group">
      {label && (
        <label htmlFor={id} className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em] mb-2.5 ml-1 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
          {label}
        </label>
      )}
      <input
        id={id}
        name={id}
        className={`modern-input w-full ${
          error ? 'border-red-500/50 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && <p className="text-red-500 dark:text-red-400 text-[10px] font-bold uppercase tracking-wider mt-2 ml-1 animate-fade-in">{error}</p>}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  id: PropTypes.string.isRequired,
  error: PropTypes.string,
};

export default Input;
