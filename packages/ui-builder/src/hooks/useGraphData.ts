import { useMemo, useState } from 'react';
import { ChartNode, DataNode, ChartNodeFilters } from '../types';
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
