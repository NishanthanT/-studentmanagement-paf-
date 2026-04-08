import PropTypes from 'prop-types';

const Button = ({ children, variant = 'primary', type = 'button', className = '', isLoading = false, ...props }) => {
  const baseStyle = "w-full py-3.5 px-6 rounded-xl font-bold transition-all duration-300 flex justify-center items-center active:scale-95 hover:scale-[1.02] transform-gpu disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";
  
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_auto] hover:bg-[position:100%_0] text-white shadow-lg shadow-blue-500/30",
    secondary: "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 bg-[length:200%_auto] hover:bg-[position:100%_0] text-gray-800 dark:text-gray-200 shadow-md",
    outline: "border-2 border-blue-500/50 hover:border-blue-500 text-blue-600 dark:text-blue-400 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent bg-[length:200%_auto] hover:bg-[position:100%_0] backdrop-blur-sm",
    danger: "bg-gradient-to-r from-red-500 via-rose-600 to-red-500 bg-[length:200%_auto] hover:bg-[position:100%_0] text-white shadow-lg shadow-red-500/30"
  };

  return (
    <button 
      type={type} 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      <span className="tracking-wide">{children}</span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'outline', 'danger']),
  type: PropTypes.string,
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default Button;
