import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { ExternalLink } from 'lucide-react';
import { Retirement } from '../../../types/dashboard';
import { formatDate } from '../../../utils/formatters';

interface RetirementHistoryProps {
  retirements: Retirement[];
}

export function RetirementHistory({ retirements }: RetirementHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Retirement History</CardTitle>
        <CardDescription>
          View your carbon credit retirement certificates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {retirements.map((retirement) => (
            <div key={retirement.id} className="border rounded-lg p-4 bg-green-50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">
                    {retirement.amount.toLocaleString()} tCO₂e Retired
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{retirement.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Retired on {formatDate(retirement.retiredAt)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 mb-2">
                    RETIRED
                  </Badge>
                  <br />
                  <Button variant="link" size="sm" className="h-auto p-0">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View Certificate
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}