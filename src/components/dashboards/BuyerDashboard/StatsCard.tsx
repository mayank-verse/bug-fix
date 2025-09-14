import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  unit: string;
  description: string;
  icon: LucideIcon;
  color: 'green' | 'blue' | 'purple' | 'teal';
}

const colorClasses = {
  green: {
    bg: 'from-green-50 to-green-100',
    text: 'text-green-600',
    value: 'text-green-700'
  },
  blue: {
    bg: '',
    text: 'text-blue-600',
    value: 'text-blue-700'
  },
  purple: {
    bg: '',
    text: 'text-purple-600',
    value: 'text-purple-700'
  },
  teal: {
    bg: '',
    text: 'text-teal-600',
    value: 'text-teal-700'
  }
};

export function StatsCard({ title, value, unit, description, icon: Icon, color }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className={color === 'green' ? `bg-gradient-to-br ${colors.bg}` : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${colors.text}`} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${colors.value}`}>
          {value.toLocaleString()}{unit && ` ${unit}`}
        </div>
        <p className={`text-xs ${colors.text} mt-1`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}