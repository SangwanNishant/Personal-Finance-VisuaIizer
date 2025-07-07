"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Transaction } from '@/types/finance';
import { getSpendingInsights } from '@/lib/finance-utils';
import { Lightbulb, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface SpendingInsightsProps {
  transactions: Transaction[];
}

export function SpendingInsights({ transactions }: SpendingInsightsProps) {
  const insights = getSpendingInsights(transactions);

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5" />
            <span>Spending Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Add more transactions to see personalized spending insights and recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5" />
          <span>Spending Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => {
            const isPositive = insight.includes('decreased') || insight.includes('Great job');
            const isWarning = insight.includes('over budget') || insight.includes('increased');
            
            return (
              <Alert key={index} className={isWarning ? 'border-orange-200' : isPositive ? 'border-green-200' : ''}>
                <div className="flex items-start space-x-2">
                  {isWarning ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5" />
                  ) : isPositive ? (
                    <TrendingDown className="h-4 w-4 text-green-600 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                  )}
                  <AlertDescription className="flex-1">
                    {insight}
                  </AlertDescription>
                </div>
              </Alert>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}