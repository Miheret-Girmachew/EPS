export function Button({ children, variant = "default", className, ...props }) {
    const variants = {
      default: "bg-purple-500 text-white hover:bg-purple-600",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };
    return (
      <button className={`px-4 py-2 rounded-md ${variants[variant]} ${className}`} {...props}>
        {children}
      </button>
    );
  }
  