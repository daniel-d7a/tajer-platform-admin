import type React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps { 
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'indigo' | 'yellow' | 'primary' | 'secondary';
  change?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  change,
}) => {
  const colorClasses = {
    blue: 'bg-[hsl(var(--primary))] text-primary-foreground bg-[hsl(var(--primary-10))]',
    green: 'bg-green-500 text-green-600 bg-green-50',
    purple: 'bg-purple-500 text-purple-600 bg-purple-50',
    indigo: 'bg-indigo-500 text-indigo-600 bg-indigo-50',
    yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
    primary: 'bg-primary text-primary-foreground bg-[hsl(var(--primary-10))]',
    secondary: 'bg-secondary text-secondary-foreground bg-[hsl(var(--secondary-10))]',
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`p-3 rounded-md ${colorClasses[color].split(' ')[2]}`}
            >
              <Icon
                className={`h-6 w-6 ${colorClasses[color].split(' ')[1]}`}
              />
            </div>
          </div>
          <div className="mr-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
            </dl>
          </div>
        </div>
        {change !== undefined && (
          <div className="mt-4">
            <div
              className={`flex items-center text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
            >
              <span>
                {change >= 0 ? '+' : ''}
                {change.toFixed(2)}%
              </span>
              <span className="text-gray-500 mr-2">من الشهر الماضي</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
