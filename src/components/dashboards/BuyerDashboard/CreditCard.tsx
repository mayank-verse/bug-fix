import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { ExternalLink } from 'lucide-react';
import { CarbonCredit } from '../../../types/dashboard';
import { getHealthScoreColor, getHealthScoreLabel, formatDate } from '../../../utils/formatters';

interface CreditCardProps {
  credit: CarbonCredit;
  type: 'available' | 'owned';
  onAction: (credit: CarbonCredit) => void;
  actionLabel: string;
  actionIcon: React.ElementType;
  actionClass?: string;
}

export function CreditCard({ 
  credit, 
  type, 
  onAction, 
  actionLabel, 
  actionIcon: ActionIcon,
  actionClass = '' 
}: CreditCardProps) {
  return (
    <Card className={`hover:shadow-lg transition-shadow ${type === 'owned' ? 'border-green-200' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Project {credit.projectId.slice(-8)}</CardTitle>
          <Badge className={
            type === 'owned' 
              ? 'bg-green-100 text-green-800' 
              : credit.healthScore >= 0.8 
                ? 'bg-green-100 text-green-800' 
                : credit.healthScore >= 0.6 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
          }>
            {type === 'owned' ? 'OWNED' : getHealthScoreLabel(credit.healthScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className={`text-3xl font-bold ${type === 'owned' ? 'text-green-700' : 'text-blue-700'}`}>
            {credit.amount.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">tCO₂e {type === 'owned' ? 'Owned' : 'Available'}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Quality Score</span>
            <span className={getHealthScoreColor(credit.healthScore)}>
              {(credit.healthScore * 100).toFixed(1)}%
            </span>
          </div>
          <Progress value={credit.healthScore * 100} className="h-2" />
        </div>

        <div className="text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>Verified:</span>
            <span>{formatDate(credit.verifiedAt)}</span>
          </div>
          {type === 'available' && (
            <div className="flex items-center justify-between mt-1">
              <span>Evidence:</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                IPFS
              </Button>
            </div>
          )}
        </div>

        <Separator />

        <Button 
          size="sm" 
          className={`w-full ${actionClass}`}
          onClick={() => onAction(credit)}
        >
          <ActionIcon className="h-4 w-4 mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}