import React, {useState, useRef, ReactNode, useEffect} from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonDesign = 'default' | 'rounded' | 'pill' | 'circle';
type IconPosition = 'left' | 'right' | 'top' | 'bottom';

interface RippleProps {
    id: number;
    x: number;
    y: number;
    size: number;
    hold: boolean;
}

interface MaterialButtonProps {
    children?: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    design?: ButtonDesign;
    icon?: ReactNode;
    iconPosition?: IconPosition;
    fullWidth?: boolean;
    disabled?: boolean;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    buttonClassName?: string;
    rippleClassName?: string;
}

const MaterialButton = ({
                            children,
                            variant = 'primary',
                            size = 'md',
                            design = 'default',
                            icon,
                            iconPosition = 'left',
                            fullWidth = false,
                            disabled = false,
                            onClick,
                            className = '',
                            buttonClassName = '',
                            rippleClassName = '',
                        }: MaterialButtonProps) => {
    const [ripples, setRipples] = useState<RippleProps[]>([]);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const rippleCounter = useRef(0);

    // Variant styles
    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-black',
        info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
        dark: 'bg-gray-800 hover:bg-gray-900 text-white',
        light: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    };

    // Size styles
    const sizeStyles = {
        sm: 'text-xs py-1 px-2',
        md: 'text-sm py-2 px-4',
        lg: 'text-base py-3 px-6',
    };

    // Design styles
    const designStyles = {
        default: 'rounded',
        rounded: 'rounded-lg',
        pill: 'rounded-full',
        circle: 'rounded-full aspect-square',
    };

    // Layout styles based on icon position
    const getLayoutStyles = () => {
        if (!icon) return 'justify-center items-center';

        switch (iconPosition) {
            case 'left':
                return 'flex-row justify-center items-center space-x-2';
            case 'right':
                return 'flex-row-reverse justify-center items-center space-x-2 space-x-reverse';
            case 'top':
                return 'flex-col justify-center items-center space-y-1';
            case 'bottom':
                return 'flex-col-reverse justify-center items-center space-y-1 space-y-reverse';
            default:
                return 'flex-row justify-center items-center space-x-2';
        }
    };

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>, hold = true) => {
        if (!buttonRef.current || disabled) return;

        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Calculate ripple size based on the larger dimension of the button
        // to ensure it covers the entire button
        const size = Math.max(
            Math.max(rect.width, rect.height) * 2,
            Math.max(
                Math.max(x, rect.width - x) * 2 + 40,
                Math.max(y, rect.height - y) * 2 + 40
            )
        );

        const newRipple = {id: rippleCounter.current++, x, y, size, hold};

        setRipples(prev => [...prev, newRipple]);

        if (onClick && event.type === 'mousedown') {
            onClick(event);
        }
    };

    const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(event, true);
    };

    const handleMouseUp = () => {
        // Release held ripples
        setRipples(prev =>
            prev.map(ripple => ({...ripple, hold: false}))
        );

        // Remove released ripples after animation
        setTimeout(() => {
            setRipples(prev => prev.filter(ripple => ripple.hold));
        }, 600);
    };

    const handleMouseLeave = () => {
        // Also release ripples when mouse leaves the button
        handleMouseUp();
    };

    // Clean up any ripples if component unmounts while ripples are active
    useEffect(() => {
        return () => {
            setRipples([]);
        };
    }, []);

    return (
        <button
            ref={buttonRef}
            className={`
        relative overflow-hidden
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${designStyles[design]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
        transition-colors duration-200
        flex ${getLayoutStyles()}
        focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-blue-500
        ${className}
        ${buttonClassName}
      `}
            disabled={disabled}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
        >
            {icon && (iconPosition === 'left' || iconPosition === 'top') && (
                <span className="flex items-center justify-center">{icon}</span>
            )}

            {
                children ?
                    <span>{children}</span>
                    : ''
            }

            {icon && (iconPosition === 'right' || iconPosition === 'bottom') && (
                <span className="flex items-center justify-center">{icon}</span>
            )}

            {/* Ripple effects */}
            {ripples.map(ripple => (
                <span
                    key={ripple.id}
                    className={`
            absolute block rounded-full 
            bg-white bg-opacity-35
            ${rippleClassName}
          `}
                    style={{
                        left: ripple.x - ripple.size / 2,
                        top: ripple.y - ripple.size / 2,
                        width: ripple.size,
                        height: ripple.size,
                        opacity: ripple.hold ? 0.35 : 0,
                        transform: `scale(${ripple.hold ? 0.5 : 1})`,
                        transition: `transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`,
                    }}
                />
            ))}
        </button>
    );
};

export default MaterialButton

// Example component that shows the MaterialButton in use
// const ButtonDemo = () => {
//   // Import a few icons from Lucide
//   const { Heart, ArrowRight, Check, Plus, X, Menu, Settings, User } = require('lucide-react');
//
//   return (
//     <div className="p-6 space-y-8 bg-gray-100 rounded-lg max-w-3xl mx-auto">
//       <div>
//         <h1 className="text-2xl font-bold mb-4">Material Button Component</h1>
//         <p className="text-gray-600 mb-8">
//           A reusable button component with Android-style ripple effects and customization options
//         </p>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Button Variants</h2>
//         <div className="flex flex-wrap gap-2">
//           <MaterialButton variant="primary">Primary</MaterialButton>
//           <MaterialButton variant="secondary">Secondary</MaterialButton>
//           <MaterialButton variant="success">Success</MaterialButton>
//           <MaterialButton variant="danger">Danger</MaterialButton>
//           <MaterialButton variant="warning">Warning</MaterialButton>
//           <MaterialButton variant="info">Info</MaterialButton>
//           <MaterialButton variant="dark">Dark</MaterialButton>
//           <MaterialButton variant="light">Light</MaterialButton>
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Button Designs</h2>
//         <div className="flex flex-wrap gap-2">
//           <MaterialButton design="default">Default</MaterialButton>
//           <MaterialButton design="rounded">Rounded</MaterialButton>
//           <MaterialButton design="pill">Pill</MaterialButton>
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Button Sizes</h2>
//         <div className="flex flex-wrap gap-2 items-center">
//           <MaterialButton size="sm">Small</MaterialButton>
//           <MaterialButton size="md">Medium</MaterialButton>
//           <MaterialButton size="lg">Large</MaterialButton>
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Icons Placement</h2>
//         <div className="flex flex-wrap gap-2">
//           <MaterialButton icon={<Heart size={16} />} iconPosition="left">
//             Left Icon
//           </MaterialButton>
//           <MaterialButton icon={<ArrowRight size={16} />} iconPosition="right">
//             Right Icon
//           </MaterialButton>
//           <MaterialButton icon={<Check size={16} />} iconPosition="top">
//             Top Icon
//           </MaterialButton>
//           <MaterialButton icon={<Plus size={16} />} iconPosition="bottom">
//             Bottom Icon
//           </MaterialButton>
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Icon-only Buttons</h2>
//         <div className="flex flex-wrap gap-2">
//           <MaterialButton className="p-2 h-10 w-10" icon={<Menu size={20} />} />
//           <MaterialButton className="p-2 h-10 w-10" icon={<Settings size={20} />} design="rounded" />
//           <MaterialButton className="p-2 h-10 w-10" icon={<User size={20} />} design="pill" variant="secondary" />
//           <MaterialButton className="p-2 h-10 w-10" icon={<X size={20} />} variant="danger" />
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Custom Styling Example</h2>
//         <div className="flex flex-wrap gap-2">
//           <MaterialButton
//             className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
//             buttonClassName="border-2 border-white font-bold"
//             rippleClassName="bg-purple-200"
//           >
//             Custom Style
//           </MaterialButton>
//
//           <MaterialButton
//             design="pill"
//             className="bg-amber-500 hover:bg-amber-600 shadow-lg hover:shadow-xl"
//             rippleClassName="bg-yellow-200"
//           >
//             Custom Pill
//           </MaterialButton>
//         </div>
//       </div>
//
//       <div className="space-y-4">
//         <h2 className="text-xl font-bold">Other Features</h2>
//         <div className="space-y-2">
//           <MaterialButton fullWidth>Full Width Button</MaterialButton>
//           <MaterialButton disabled>Disabled Button</MaterialButton>
//         </div>
//       </div>
//     </div>
//   );
// };
//
// export default ButtonDemo;