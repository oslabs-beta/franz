import { PromQuery } from "../../../../../types/types";

/* Broker Queries */
export const BROKER_CPU_USAGE: PromQuery = {
  name: "Broker CPU Usage",
  query:
    'rate(process_cpu_seconds_total{job="kafka", instance=~"filter"}[1m])*100',
  type: "broker",
};

export const JVM_MEMORY_USAGE: PromQuery = {
  name: "JVM Memory Usage",
  query:
    '(sum(avg_over_time(jvm_memory_bytes_used{area="heap", job!="zookeeper", instance=~"filter"}[1m]))by(application,instance)/sum(avg_over_time(jvm_memory_bytes_committed{area="heap", job!="zookeeper", instance=~"filter"}[1m]))by(application,instance))*100',
  type: "broker",
};

export const BYTES_IN_PER_SEC: PromQuery = {
  name: "Bytes in Per Sec (Brokers)",
  query:
    'sum(rate(kafka_server_brokertopicmetrics_bytesinpersec{topic!="", instance=~"filter"}[60s]))by(topic)',
  type: "broker",
};

export const BYTES_OUT_PER_SEC: PromQuery = {
  name: "Bytes out Per Sec (Brokers)",
  query:
    'sum(rate(kafka_server_brokertopicmetrics_bytesoutpersec{topic!="", instance=~"filter"}[60s]))by(topic)',
  type: "broker",
};

/* This is can be a query on the cluster or broker, and uses type broker to filter correctly */
export const TOTAL_UNDER_REPLICATED_PARTITIONS: PromQuery = {
  name: "Under Replicated Partitions",
  query:
    'sum(kafka_server_replicamanager_underreplicatedpartitions{instance=~"filter"})',
  type: "broker",
};

/* This can be altered to be topic based */
export const MESSAGES_IN_PER_SEC: PromQuery = {
  name: "Message in per Second",
  query:
    'sum(rate(kafka_server_brokertopicmetrics_messagesinpersec{topic!="", instance=~"filter"}[60s]))by(topic)',
  type: "broker",
};

/* Topic Queries */
export const GET_TOTAL_REPLICAS: PromQuery = {
  name: "Get Total Replicas",
  query:
    '(sum(kafka_cluster_partition_replicascount{topic=~"filter"})by(instance))>0',
  type: "topic",
};

export const REPLICAS_PER_BROKER: PromQuery = {
  name: "Replicas per broker",
  query:
    '(sum(kafka_cluster_partition_replicascount{topic=~"filter"})by(instance))>0',
  type: "topic",
};

export const TOTAL_ISRS: PromQuery = {
  name: "Total ISRs",
  query:
    '(sum(kafka_cluster_partition_insyncreplicascount{topic=~"filter"})by(topic))',
  type: "topic",
};

export const LOG_SIZE: PromQuery = {
  name: "Total ISRs",
  query: '(sum(kafka_log_log_size{topic=~"filter"})by(topic))',
  type: "topic",
};

/* Cluster Queries */
export const GET_ACTIVE_CONTROLLER_COUNT: PromQuery = {
  name: "Active Controller Count",
  query: "sum(kafka_controller_kafkacontroller_activecontrollercount)",
  type: "cluster",
};

export const OFFLINE_PARTITION_COUNT: PromQuery = {
  name: "Offline Partition Count",
  query: "sum(kafka_controller_kafkacontroller_offlinepartitionscount)",
  type: "cluster",
};

/* This query can be used with a filter on topics */
export const UNDER_MIN_ISR: PromQuery = {
  name: "Under Min ISR",
  query: 'sum(kafka_cluster_partition_underminisr{topic=~"filter"})',
  type: "cluster",
};
