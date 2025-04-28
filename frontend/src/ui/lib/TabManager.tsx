import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Settings, Home, Users, Calendar, Bell, Bookmark, Mail } from 'lucide-react';

// Animation variants for tab content
const tabAnimations = {
  slide: {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  },
  fade: {
    enter: {
      opacity: 0
    },
    center: {
      opacity: 1
    },
    exit: {
      opacity: 0
    }
  },
  scale: {
    enter: {
      scale: 0.8,
      opacity: 0
    },
    center: {
      scale: 1,
      opacity: 1
    },
    exit: {
      scale: 0.8,
      opacity: 0
    }
  },
  rotate: {
    enter: (direction: number) => ({
      rotateY: direction > 0 ? 90 : -90,
      opacity: 0
    }),
    center: {
      rotateY: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      rotateY: direction < 0 ? 90 : -90,
      opacity: 0
    })
  },
  flip: {
    enter: {
      rotateX: 90,
      opacity: 0
    },
    center: {
      rotateX: 0,
      opacity: 1
    },
    exit: {
      rotateX: -90,
      opacity: 0
    }
  },
  bounce: {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 15
      }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }
};

// Indicator animations
const indicatorAnimations = {
  slide: {
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  float: {
    x: 0,
    y: [0, -5, 0],
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      y: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
    }
  },
  pulse: {
    x: 0,
    scale: [1, 1.05, 1],
    transition: {
      x: { type: 'spring', stiffness: 300, damping: 30 },
      scale: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' }
    }
  },
  elastic: {
    x: 0,
    transition: { type: 'spring', stiffness: 500, damping: 15 }
  },
  bounce: {
    x: 0,
    transition: { type: 'spring', stiffness: 700, damping: 15 }
  },
  smooth: {
    x: 0,
    transition: { ease: 'easeInOut', duration: 0.4 }
  }
};

// Tab icons mapping
const tabIcons = {
  Home: <Home size={20} />,
  Profile: <Users size={20} />,
  Calendar: <Calendar size={20} />,
  Notifications: <Bell size={20} />,
  Bookmarks: <Bookmark size={20} />,
  Messages: <Mail size={20} />,
  Settings: <Settings size={20} />
};

// Tab presets for demo
const demoTabs = [
  { id: 'home', label: 'Home', content: 'Home content goes here', icon: 'Home' },
  { id: 'profile', label: 'Profile', content: 'Profile content goes here', icon: 'Profile' },
  { id: 'calendar', label: 'Calendar', content: 'Calendar content goes here', icon: 'Calendar' },
  { id: 'notifications', label: 'Notifications', content: 'Notifications content goes here', icon: 'Notifications' },
  { id: 'bookmarks', label: 'Bookmarks', content: 'Bookmarks content goes here', icon: 'Bookmarks' },
  { id: 'messages', label: 'Messages', content: 'Messages content goes here', icon: 'Messages' },
  { id: 'settings', label: 'Settings', content: 'Settings content goes here', icon: 'Settings' }
];

// Types
interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  contentAnimation?: keyof typeof tabAnimations;
  indicatorAnimation?: keyof typeof indicatorAnimations;
  showIcons?: boolean;
  maxTabsVisible?: number;
  orientation?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end' | 'between' | 'around';
  size?: 'sm' | 'md' | 'lg';

  // Separate tab and indicator styles
  tabStyle?: 'default' | 'plain' | 'rounded' | 'boxed' | 'minimal';
  indicatorStyle?: 'none' | 'line' | 'pill' | 'block' | 'underline' | 'bar';

  // Colors
  activeTextColor?: string;
  inactiveTextColor?: string;
  indicatorColor?: string;
  hoverColor?: string;
}

// Size mappings
const sizeMappings = {
  sm: "text-sm py-1 px-2",
  md: "text-base py-2 px-4",
  lg: "text-lg py-3 px-6"
};

export default function TabManager({
  tabs = demoTabs,
  defaultTab,
  contentAnimation = 'slide',
  indicatorAnimation = 'float',
  showIcons = true,
  maxTabsVisible = 5,
  orientation = 'horizontal',
  align = 'start',
  size = 'md',

  // Style options
  tabStyle = 'default',
  indicatorStyle = 'line',

  // Colors
  activeTextColor = 'text-blue-600',
  inactiveTextColor = 'text-gray-600',
  indicatorColor = 'bg-blue-500',
  hoverColor = 'hover:text-blue-500'
}: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);
  const [direction, setDirection] = useState(0);
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>(tabs.slice(0, maxTabsVisible));
  const [startIndex, setStartIndex] = useState(0);
  const [selectedContentAnimation, setSelectedContentAnimation] = useState(contentAnimation);
  const [selectedIndicatorAnimation, setSelectedIndicatorAnimation] = useState(indicatorAnimation);
  const [selectedTabStyle, setSelectedTabStyle] = useState(tabStyle);
  const [selectedIndicatorStyle, setSelectedIndicatorStyle] = useState(indicatorStyle);

  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabListRef = useRef<HTMLDivElement>(null);

  const canScrollLeft = startIndex > 0;
  const canScrollRight = startIndex + maxTabsVisible < tabs.length;

  // Configure tab styles based on selected options
  const getTabStyles = (isActive: boolean) => {
    const baseStyle = sizeMappings[size] + " transition-colors duration-300 focus:outline-none relative flex items-center justify-center";
    const textColor = isActive ? activeTextColor : `${inactiveTextColor} ${hoverColor}`;

    let styleClasses = "";

    switch (selectedTabStyle) {
      case 'rounded':
        styleClasses = "rounded-lg";
        break;
      case 'boxed':
        styleClasses = `border-2 ${isActive ? 'border-blue-500' : 'border-transparent'}`;
        break;
      case 'minimal':
        styleClasses = "";
        break;
      case 'plain':
        styleClasses = "";
        break;
      case 'default':
      default:
        styleClasses = "mx-1";
        break;
    }

    return `${baseStyle} ${textColor} ${styleClasses}`;
  };

  // Get indicator styles based on selected indicator style
  const getIndicatorStyles = () => {
    if (!tabRefs.current[activeTab]) return {};

    const tabElement = tabRefs.current[activeTab];
    if (!tabElement) return {};

    const left = tabElement.offsetLeft;
    const width = tabElement.offsetWidth;
    const height = tabElement.offsetHeight;
    const top = tabElement.offsetTop;

    switch (selectedIndicatorStyle) {
      case 'line':
        return {
          width: `${width}px`,
          height: '2px',
          left: `${left}px`,
          bottom: '0px',
          top: orientation === 'horizontal' ? 'auto' : 'unset'
        };
      case 'pill':
        return {
          width: `${width}px`,
          height: `${height}px`,
          left: `${left}px`,
          top: `${top}px`,
          borderRadius: '9999px'
        };
      case 'block':
        return {
          width: `${width}px`,
          height: `${height}px`,
          left: `${left}px`,
          top: `${top}px`
        };
      case 'underline':
        return {
          width: `${width}px`,
          height: '3px',
          left: `${left}px`,
          bottom: '-1px',
          top: orientation === 'horizontal' ? 'auto' : 'unset'
        };
      case 'bar':
        if (orientation === 'horizontal') {
          return {
            width: `${width}px`,
            height: '4px',
            left: `${left}px`,
            bottom: '0px'
          };
        } else {
          return {
            width: '4px',
            height: `${height}px`,
            left: '0px',
            top: `${top}px`
          };
        }
      case 'none':
      default:
        return { opacity: 0 };
    }
  };

  const alignClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around"
  };

  useEffect(() => {
    // Update the visible tabs when tabs change
    updateVisibleTabs(startIndex);
  }, [tabs, maxTabsVisible, startIndex]);

  useEffect(() => {
    // Force update of indicator position after render
    const timer = setTimeout(() => {
      updateIndicatorPosition();
    }, 50);

    return () => clearTimeout(timer);
  }, [activeTab, visibleTabs, selectedIndicatorAnimation, selectedIndicatorStyle]);

  const updateIndicatorPosition = () => {
    if (!indicatorRef.current || !tabRefs.current[activeTab]) return;

    const styles = getIndicatorStyles();
    Object.assign(indicatorRef.current.style, styles);
  };

  const updateVisibleTabs = (start: number) => {
    const end = Math.min(start + maxTabsVisible, tabs.length);
    setVisibleTabs(tabs.slice(start, end));
  };

  const handleTabClick = (tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    const newIndex = tabs.findIndex(tab => tab.id === tabId);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(tabId);
  };

  const scrollLeft = () => {
    if (canScrollLeft) {
      const newStartIndex = Math.max(0, startIndex - 1);
      setStartIndex(newStartIndex);
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      const newStartIndex = Math.min(tabs.length - maxTabsVisible, startIndex + 1);
      setStartIndex(newStartIndex);
    }
  };

  const renderTabIcon = (tab: Tab) => {
    if (!showIcons || !tab.icon) return null;
    return <span className="mr-2">{tab.icon in tabIcons ? tabIcons[tab.icon as keyof typeof tabIcons] : null}</span>;
  };

  // Get the indicator class
  const getIndicatorClass = () => {
    let classes = `absolute ${indicatorColor} transition-all`;

    switch (selectedIndicatorStyle) {
      case 'line':
        classes += ' z-10';
        break;
      case 'pill':
        classes += ' -z-10 opacity-20 rounded-full';
        break;
      case 'block':
        classes += ' -z-10 opacity-20';
        break;
      case 'underline':
        classes += ' z-10';
        break;
      case 'bar':
        classes += ' z-10';
        break;
      case 'none':
        classes += ' hidden';
        break;
    }

    return classes;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Content Animation</label>
          <select
            className="w-full px-3 py-2 rounded border border-gray-300"
            value={selectedContentAnimation}
            onChange={(e) => setSelectedContentAnimation(e.target.value as keyof typeof tabAnimations)}
          >
            {Object.keys(tabAnimations).map(animation => (
              <option key={animation} value={animation}>{animation.charAt(0).toUpperCase() + animation.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Indicator Animation</label>
          <select
            className="w-full px-3 py-2 rounded border border-gray-300"
            value={selectedIndicatorAnimation}
            onChange={(e) => setSelectedIndicatorAnimation(e.target.value as keyof typeof indicatorAnimations)}
          >
            {Object.keys(indicatorAnimations).map(animation => (
              <option key={animation} value={animation}>{animation.charAt(0).toUpperCase() + animation.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tab Style</label>
          <select
            className="w-full px-3 py-2 rounded border border-gray-300"
            value={selectedTabStyle}
            onChange={(e) => setSelectedTabStyle(e.target.value as 'default' | 'plain' | 'rounded' | 'boxed' | 'minimal')}
          >
            <option value="default">Default</option>
            <option value="plain">Plain</option>
            <option value="rounded">Rounded</option>
            <option value="boxed">Boxed</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        <div className="w-full md:w-1/4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Indicator Style</label>
          <select
            className="w-full px-3 py-2 rounded border border-gray-300"
            value={selectedIndicatorStyle}
            onChange={(e) => setSelectedIndicatorStyle(e.target.value as 'none' | 'line' | 'pill' | 'block' | 'underline' | 'bar')}
          >
            <option value="none">None</option>
            <option value="line">Line</option>
            <option value="pill">Pill</option>
            <option value="block">Block</option>
            <option value="underline">Underline</option>
            <option value="bar">Bar</option>
          </select>
        </div>
      </div>

      <div className={`relative ${orientation === 'vertical' ? 'flex' : 'block'}`}>
        {/* Tab Navigation */}
        <div
          ref={tabListRef}
          className={`relative ${orientation === 'vertical' ? 'w-1/4 mr-4' : 'w-full'} mb-4`}
        >
          <div className="flex items-center">
            {canScrollLeft && (
              <button
                onClick={scrollLeft}
                className="p-1 text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <ChevronLeft size={20} />
              </button>
            )}

            <div
              className={`relative flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} ${alignClasses[align]} flex-1 overflow-hidden`}
            >
              {visibleTabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => (tabRefs.current[tab.id] = el)}
                  className={getTabStyles(activeTab === tab.id)}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {renderTabIcon(tab)}
                  {tab.label}
                </button>
              ))}

              {/* Indicator */}
              <motion.div
                ref={indicatorRef}
                className={getIndicatorClass()}
                initial={false}
                animate={indicatorAnimations[selectedIndicatorAnimation]}
                style={getIndicatorStyles()}
              />
            </div>

            {canScrollRight && (
              <button
                onClick={scrollRight}
                className="p-1 text-gray-500 hover:text-gray-800 focus:outline-none"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className={`${orientation === 'vertical' ? 'w-3/4' : 'w-full'} rounded relative overflow-hidden bg-white rounded-lg p-6 border border-gray-200`}>
          <AnimatePresence custom={direction} mode="wait">
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabAnimations[selectedContentAnimation]}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="h-64"
            >
              {tabs.find(tab => tab.id === activeTab)?.content}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}