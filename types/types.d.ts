// import { DocumentNode } from "graphql";
import { OverridableStringUnion } from "@mui/types";

interface PromQuery {
  name: string;
  query: string;
  type: string;
}
export interface DefaultErr {
  log: string;
  status: number;
  message: Messsage;
}

export interface Messsage {
  err: string;
}

export interface Broker {
  brokerId: number;
  brokerPort: number;
  brokerHost: string;
  brokerCpuUsage?: Count;
  start?: string;
  end?: string;
  step?: string;
}

export interface BrokerCpuUsage {
  cpuUsage: number;
  time: string;
}

export interface JVMMemoryUsage extends Metric {
  JVMMemoryUsage: number;
}

export interface Topic {
  name: string;
  numPartitions: number;
  totalReplicas: number;
  totalIsrs: number;
  brokersWithReplicas: [number];
  logSize: number;
}

export interface Metric {
  time: string;
}

export interface Count extends Metric {
  // purposefully using a quick fix. to get code pushed up before correcting things
  metric: number;
}

export interface TimeSeriesCount {
  topic?: string;
  values: Count[];
}

export interface Cluster {
  activeController: Broker;
  brokers: Broker[];
  activeControllerCount?: Count;
  offlinePartitionCount?: Count;
  underMinIsr?: Count;
  logSize?: Count;
}

export interface UnderReplicatedPartitions {
  underReplicatedPartitions: number;
  time: string;
}

export interface GqlChartProps {
  query: DocumentNode;
  metric: string;
  duration: number;
  step: string;
  pollInterval?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  resource?: string;
  label?: string;
  args?: unknown;
}

export interface MetricsCardProps {
  value?: string | number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  query?: DocumentNode;
  variables?: any;
  searchingFor?: string;
}

export interface ConfigEntries {
  name: string;
  value: string;
}

export interface DialogProps {
  title: string;
  content: string;
  label: string; //id and label will be same, but label may contain spaces?
  actions: DocumentNode;
  control: string;
  args: any;
  variant: OverridableStringUnion<"text" | "outlined" | "contained">;
  cta: string;
  color: OverridableStringUnion<
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning"
  >;
  disabled: boolean;
  update: () => Promise<any>;
}
export interface MoreInfoProps {
  icon: React.ReactNode;
  content: string;
}
