// src/components/EnhancedMetricCard.tsx

import { useState, useEffect } from "react";
import { TrendingUp } from "lucide-react";

const AnimatedCounter = ({
  value,
  duration = 1000,
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(value * easeOut));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <span>{count}</span>;
};

export const EnhancedMetricCard = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  delay = 0,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend?: { value: number; isPositive: boolean };
  delay?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const colorClasses = {
    info: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-150 dark:from-gray-800 dark:to-gray-800/50 dark:border-blue-900 dark:hover:border-blue-700",
    warning:
      "bg-gradient-to-br from-amber-50 to-yellow-100 border-amber-200 hover:from-amber-100 hover:to-yellow-150 dark:from-gray-800 dark:to-gray-800/50 dark:border-amber-900 dark:hover:border-amber-700",
    success:
      "bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 hover:from-green-100 hover:to-emerald-150 dark:from-gray-800 dark:to-gray-800/50 dark:border-green-900 dark:hover:border-green-700",
    primary:
      "bg-gradient-to-br from-amber-100 to-yellow-200 border-amber-300 hover:from-amber-200 hover:to-yellow-300 dark:from-gray-800 dark:to-gray-800/50 dark:border-amber-800 dark:hover:border-amber-600",
  };
  const iconColors = {
    info: "text-blue-600 dark:text-blue-400",
    warning: "text-amber-600 dark:text-amber-400",
    success: "text-green-600 dark:text-green-400",
    primary: "text-amber-700 dark:text-amber-300",
  };

  return (
    <div
      className={`
        ${colorClasses[color]} 
        p-6 rounded-xl border-2 cursor-pointer
        transform transition-all duration-500 ease-out
        hover:scale-105 hover:shadow-2xl hover:-translate-y-1
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        group relative overflow-hidden dark:hover:shadow-amber-500/10
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out dark:via-white/5" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`${iconColors[color]} transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}
          >
            <Icon size={24} />
          </div>
          {trend && (
            <div
              className={`flex items-center text-sm ${
                trend.isPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              <TrendingUp
                size={16}
                className={`mr-1 ${
                  !trend.isPositive ? "rotate-180" : ""
                } transition-transform duration-300`}
              />
              {trend.value}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-300 dark:text-gray-400 dark:group-hover:text-gray-300">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 group-hover:text-amber-800 transition-colors duration-300 dark:text-gray-100 dark:group-hover:text-amber-400">
            <AnimatedCounter value={value} />
          </p>
        </div>
      </div>
    </div>
  );
};
