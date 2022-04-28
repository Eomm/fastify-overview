import React, { useMemo, useState } from 'react';

import { ChartNode, ChartNodeFilters, DataNode } from '../types';
import { transformData } from '../utils/data';

interface UseGraphResult {
  chartData: ChartNode | null;
  filters: ChartNodeFilters;
  setFilters: React.Dispatch<React.SetStateAction<ChartNodeFilters>>;
}

export default function useGraphData(data: DataNode): UseGraphResult {
  const [filters, setFilters] = useState<ChartNodeFilters>({
    showDecorators: true,
    showRoutes: true,
    showHooks: true,
  });

  const chartData = useMemo(() => {
    return transformData(data, filters);
  }, [data, filters]);

  return {
    chartData,
    filters,
    setFilters,
  };
}
