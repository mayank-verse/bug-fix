import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Leaf } from 'lucide-react';
import { CarbonCredit } from '../../../types/dashboard';
import { getHealthScoreColor, getHealthScoreLabel } from '../../../utils/formatters';

interface RetirementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credit: CarbonCredit | null;
  retirementReason: string;
  onRetirementReasonChange: (reason: string) => void;
  onRetire: () => void;
}

export function RetirementDialog({
  open,
  onOpenChange,
  credit,
  retirementReason,
  onRetirementReasonChange,
  onRetire
}: RetirementDialogProps) {
  if (!credit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Retire Carbon Credits</DialogTitle>
          <DialogDescription>
            Permanently retire carbon credits to offset your emissions
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Credit Amount</p>
                <p className="font-semibold">{credit.amount.toLocaleString()} tCO₂e</p>
              </div>
              <div>
                <p className="text-gray-600">Project Quality</p>
                <p className={`font-semibold ${getHealthScoreColor(credit.healthScore)}`}>
                  {getHealthScoreLabel(credit.healthScore)}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="retirement-reason">Reason for Retirement</Label>
            <Textarea
              id="retirement-reason"
              placeholder="e.g., Offsetting corporate emissions for Q4 2024"
              value={retirementReason}
              onChange={(e) => onRetirementReasonChange(e.target.value)}
              required
            />
          </div>

          <div className="bg-red-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-red-800">⚠️ Permanent Action</p>
            <p className="text-red-700 mt-1">
              Retiring {credit.amount.toLocaleString()} tCO₂e credits will permanently remove them from circulation.
              This action cannot be undone.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={onRetire} 
              disabled={!retirementReason.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Leaf className="h-4 w-4 mr-2" />
              Retire Credits
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}