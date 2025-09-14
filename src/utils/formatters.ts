export const getHealthScoreColor = (score: number) => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

export const getHealthScoreLabel = (score: number) => {
  if (score >= 0.8) return 'Premium Quality';
  if (score >= 0.6) return 'Standard Quality';
  return 'Basic Quality';
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};