import { globalConfig } from '../config/config';
import { IAggregationConfigElement, ISourceConfigElement } from '../types';
import { getLastStatus } from '../mongo/models/schedulerLog';
import { getAggregationTaskId, getCopyTaskId } from '../util/names';

interface IAggregationTask {
  collection: string;
  enabled: boolean;
  sources: string[];
  status?: string;
}

interface ISourceTask {
  collection: string;
  enabled: boolean;
  copyCronRule?: string;
  copyMissingIdsCronRule?: string;
  removeCronRule?: string;
  status?: string | null;
}

const aggregationConfigs = globalConfig.aggregation;
const sourceConfigs = globalConfig.source;

const aggregations: IAggregationTask[] = [];
const sources: ISourceTask[] = [];

for (const aggregation of Object.keys(aggregationConfigs)) {
  aggregations.push(makeAggregationTask(aggregationConfigs[aggregation]));
}

for (const source of Object.keys(sourceConfigs)) {
  sources.push(makeSourceTask(sourceConfigs[source]));
}

function makeAggregationTask(
  aggregation: IAggregationConfigElement
): IAggregationTask {
  return {
    collection: aggregation.collection,
    enabled: !aggregation.disabled,
    sources: Object.keys(aggregation.sources)
  };
}

function makeSourceTask(source: ISourceConfigElement): ISourceTask {
  return {
    collection: source.collection,
    enabled: !source.disabled,
    copyCronRule: source.copyCronRule,
    copyMissingIdsCronRule: source.copyMissingIdsCronRule,
    removeCronRule: source.removeCronRule
  };
}

export async function getTasks() {
  console.log('get tasks');
  const taskSources = sources.slice();
  const taskAgg = aggregations.slice();
  const statuses = await Promise.all([
    Promise.all(
      taskSources.map((source) => getLastStatus(getCopyTaskId(source.collection)))
    ),
    Promise.all(
      taskAgg.map((agg) => getLastStatus(getAggregationTaskId(agg.collection)))
    )
  ]);

  taskSources.forEach((s, idx) => (s.status = statuses[0][idx]));
  taskAgg.forEach((agg, idx) => (agg.status = statuses[1][idx]));

  console.log('return');
  return {
    sources: taskSources,
    aggregations: taskAgg
  };
}

export function getAggregation(name: string) {
  return aggregations.find((aggregation) => aggregation.collection === name);
}

export function getSource(name: string) {
  return sources.find((source) => source.collection === name);
}
