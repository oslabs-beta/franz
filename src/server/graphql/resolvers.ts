import * as brokerData from "./datasources/brokerAdmin";
import { Broker, Cluster, Count } from "../../../types/types";
import { OngoingTopicReassignment } from "kafkajs";
import {
  BROKER_CPU_USAGE,
  BYTES_IN_PER_SEC,
  BYTES_OUT_PER_SEC,
  GET_ACTIVE_CONTROLLER_COUNT,
  GET_TOTAL_REPLICAS,
  JVM_MEMORY_USAGE,
  LOG_SIZE,
  MESSAGES_IN_PER_SEC,
  OFFLINE_PARTITION_COUNT,
  REPLICAS_PER_BROKER,
  TOTAL_ISRS,
  TOTAL_UNDER_REPLICATED_PARTITIONS,
  UNDER_MIN_ISR,
} from "./datasources/models/promQueries";

const resolvers = {
  Broker: {
    bytesInPerSecondOverTime: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const brokerBytesInPerSecond =
          await dataSources.prometheusAPI.queryDataRange(
            BYTES_IN_PER_SEC,
            parent.start,
            parent.end,
            parent.step,
            [parent.brokerId]
          );

        console.log(brokerBytesInPerSecond);

        return brokerBytesInPerSecond;
      } catch (error) {
        console.log(
          `An error occured with Query Broker Bytes In Per Second Over Time: ${error}`
        );
      }
    },

    bytesOutPerSecondOverTime: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const brokerBytesOutPerSecond =
          await dataSources.prometheusAPI.queryDataRange(
            BYTES_OUT_PER_SEC,
            parent.start,
            parent.end,
            parent.step,
            [parent.brokerId]
          );

        return brokerBytesOutPerSecond;
      } catch (error) {
        console.log(
          `An error occured with Query Broker Bytes In Per Second Over Time: ${error}`
        );
      }
    },

    cpuUsage: async (parent, args, { dataSources }): Promise<Count> => {
      try {
        const [brokerCpu] = await dataSources.prometheusAPI.queryData(
          BROKER_CPU_USAGE,
          [parent.brokerId]
        );

        return brokerCpu;
      } catch (error) {
        console.log(`An error occured with Query Broker CPU Usage: ${error}`);
      }
    },

    cpuUsageOverTime: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count[]> => {
      try {
        const [brokerCpu] = await dataSources.prometheusAPI.queryDataRange(
          BROKER_CPU_USAGE,
          parent.start,
          parent.end,
          parent.step,
          [parent.brokerId]
        );

        return brokerCpu.values;
      } catch (error) {
        console.log(
          `An error occured with Query Broker CPU Usage Over Time: ${error}`
        );
      }
    },

    JVMMemoryUsageOverTime: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count[]> => {
      try {
        const [brokerJVMMemoryUsage] =
          await dataSources.prometheusAPI.queryDataRange(
            JVM_MEMORY_USAGE,
            parent.start,
            parent.end,
            parent.step,
            [parent.brokerId]
          );

        return brokerJVMMemoryUsage.values;
      } catch (error) {
        console.log(
          `An error occured with Query Broker Disk Usage Over Time: ${error}`
        );
      }
    },

    JVMMemoryUsage: async (parent, args, { dataSources }): Promise<Count> => {
      try {
        const [brokerJVMMemoryUsage] =
          await dataSources.prometheusAPI.queryData(JVM_MEMORY_USAGE, [
            parent.brokerId,
          ]);

        return brokerJVMMemoryUsage;
      } catch (error) {
        console.log(
          `An error has occured with Query Broker Disk Usage: ${error}`
        );
      }
    },

    numberUnderReplicatedPartitions: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const [totalUnderReplicatedPartitions] =
          await dataSources.prometheusAPI.queryData(
            TOTAL_UNDER_REPLICATED_PARTITIONS,
            [parent.brokerId]
          );

        return totalUnderReplicatedPartitions;
      } catch (error) {
        console.log(
          `An error occured with Query Broker numberUnderReplicatedPartitions: ${error}`
        );
      }
    },

    produceTotalTimeMs: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const totalProduceTimeMS =
          await dataSources.prometheusAPI.getMedianTotalTimeMs("Produce");
        const produceTotalTimeMs = totalProduceTimeMS.filter(
          (elem) => elem.brokerId === parent.brokerId
        )[0];
        return produceTotalTimeMs;
      } catch (error) {
        console.log(
          `An error has occured with Query Produce Total Time MS: ${error}`
        );
      }
    },

    consumerTotalTimeMs: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const totalConsumerTotalTimeMs =
          await dataSources.prometheusAPI.getMedianTotalTimeMs("FetchConsumer");
        const consumerTotalTimeMs = totalConsumerTotalTimeMs.filter(
          (elem) => elem.brokerId === parent.brokerId
        )[0];

        return consumerTotalTimeMs;
      } catch (error) {
        console.log(
          `An error has occured with Query Consumer Total Time MS: ${error}`
        );
      }
    },

    followerTotalTimeMs: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      try {
        const totalFollowerTotalTimeMs =
          await dataSources.prometheusAPI.getMedianTotalTimeMs("FetchFollower");
        const followerTotalTimeMs = totalFollowerTotalTimeMs.filter(
          (elem) => elem.brokerId === parent.brokerId
        )[0];
        return followerTotalTimeMs;
      } catch (error) {
        console.log(
          `An error has occured with Query Follower Total Time MS: ${error}`
        );
      }
    },
  },

  Cluster: {
    activeControllerCount: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      const [activeControllerCount] = await dataSources.prometheusAPI.queryData(
        GET_ACTIVE_CONTROLLER_COUNT
      );

      return activeControllerCount;
    },

    offlinePartitionCount: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      const [offlinePartitionCount] = await dataSources.prometheusAPI.queryData(
        OFFLINE_PARTITION_COUNT
      );

      return offlinePartitionCount;
    },

    underMinIsr: async (parent, args, { dataSources }): Promise<Count> => {
      const [underMinIsr] = await dataSources.prometheusAPI.queryData(
        UNDER_MIN_ISR
      );

      return underMinIsr;
    },

    numberUnderReplicatedPartitions: async (
      parent,
      args,
      { dataSources }
    ): Promise<Count> => {
      const [underReplicatedPartitions] =
        await dataSources.prometheusAPI.queryData(
          TOTAL_UNDER_REPLICATED_PARTITIONS
        );

      return underReplicatedPartitions;
    },

    deleteTopic: async () => {
      return await brokerData.canDelete();
    },
  },

  Topic: {
    numPartitions: (parent): number => {
      return parent.partitions.length;
    },

    totalReplicas: async ({ name }, args, { dataSources }): Promise<number> => {
      const metric = await dataSources.prometheusAPI.queryData(
        GET_TOTAL_REPLICAS,
        name
      );
      if (metric.length === 0) {
        return metric.reduce(
          (prev, current) => prev + current.metric.length,
          0
        );
      }

      return metric[0].metric;
    },

    totalIsrs: async ({ name }, args, { dataSources }): Promise<number> => {
      const metric = await dataSources.prometheusAPI.queryData(
        TOTAL_ISRS,
        name
      );
      if (metric.length === 0) {
        return metric.reduce(
          (prev, current) => prev + current.metric.length,
          0
        );
      }
      return metric[0].metric;
    },

    brokersWithReplicas: async (
      { name },
      args,
      { dataSources }
    ): Promise<number[]> => {
      const metric = await dataSources.prometheusAPI.queryData(
        REPLICAS_PER_BROKER,
        name
      );
      const brokersWithReplicas: number[] = [];
      metric.forEach((result) => brokersWithReplicas.push(result.brokerId));

      return brokersWithReplicas;
    },

    logSize: async ({ name }, args, { dataSources }): Promise<number> => {
      const metric = await dataSources.prometheusAPI.queryData(LOG_SIZE, name);
      const logSizeGB = Number((metric[0].metric / 1000000000).toFixed(2));

      return logSizeGB;
    },
  },

  Partition: {
    leader: (parent) => {
      parent.leader = { brokerId: parent.leader };
      return parent.leader;
    },

    replicas: (parent) => {
      return parent.replicas.map(
        (replica) => (replica = { brokerId: replica })
      );
    },

    isr: (parent) => {
      if (parent.isr.length === 0) return null;
      return parent.isr.map((replica) => (replica = { brokerId: replica }));
    },
  },

  Query: {
    brokers: async (
      parent,
      { start, end, step, brokerIds }
    ): Promise<Broker[]> => {
      const clusterInfo = await brokerData.getClusterInfo();
      if (start) {
        clusterInfo.brokers.forEach((broker) => {
          broker.start = start;
          broker.end = end;
          broker.step = step;
        });
      }
      if (brokerIds) {
        clusterInfo.brokers = clusterInfo.brokers.filter((broker) =>
          brokerIds.includes(broker.brokerId)
        );
      }

      return clusterInfo.brokers.sort((a, b) => a.brokerId - b.brokerId);
    },

    broker: async (
      parent: Broker,
      { brokerId, start, end, step }
    ): Promise<Broker> => {
      try {
        const cluster = await brokerData.getClusterInfo();
        const broker = cluster.brokers.filter(
          (elem) => elem.brokerId === brokerId
        )[0];

        broker.start = start;
        broker.end = end;
        broker.step = step;

        return broker;
      } catch (error) {
        console.log(`An error occured with Query Broker: ${error}`);
      }
    },

    cluster: async (): Promise<Cluster> => {
      const clusterInfo = await brokerData.getClusterInfo();
      return clusterInfo;
    },

    topic: async (parent, { name }): Promise<any> => {
      const topic = await brokerData.getSingleTopic(name);

      return topic;
    },

    topics: async (): Promise<any> => {
      const topics = await brokerData.getAllTopics();

      return topics;
    },

    totalTimeMs: async (
      parent,
      { request, brokerIds },
      { dataSources }
    ): Promise<Count> => {
      try {
        const totalTimeMs = await dataSources.prometheusAPI.getAvgTotalTimeMs(
          request,
          brokerIds
        );

        return totalTimeMs[0];
      } catch (error) {
        console.log(`An error has occured with Query Total Time MS: ${error}`);
      }
    },

    bytesInPerSecondOverTime: async (
      parent,
      { brokerIds, topics, start, step, end },
      { dataSources }
    ): Promise<Count> => {
      try {
        let allBytesInPerSecond =
          await dataSources.prometheusAPI.queryDataRange(
            BYTES_IN_PER_SEC,
            start,
            end,
            step,
            brokerIds
          );

        if (topics) {
          allBytesInPerSecond = allBytesInPerSecond.filter((el) =>
            topics.includes(el.topic)
          );
        }

        return allBytesInPerSecond;
      } catch (error) {
        console.log(`An error has occured with Query Total Time MS: ${error}`);
      }
    },

    bytesOutPerSecondOverTime: async (
      parent,
      { brokerIds, topics, start, step, end },
      { dataSources }
    ): Promise<Count> => {
      try {
        let allBytesOutPerSecond =
          await dataSources.prometheusAPI.queryDataRange(
            BYTES_OUT_PER_SEC,
            start,
            end,
            step,
            brokerIds
          );

        if (topics) {
          allBytesOutPerSecond = allBytesOutPerSecond.filter((el) =>
            topics.includes(el.topic)
          );
        }

        return allBytesOutPerSecond;
      } catch (error) {
        console.log(`An error has occured with Query Total Time MS: ${error}`);
      }
    },

    messagesInPerSec: async (
      parent,
      { brokerIds, topics, start, step, end },
      { dataSources }
    ): Promise<Count> => {
      try {
        let allMessagesInPerSec =
          await dataSources.prometheusAPI.queryDataRange(
            MESSAGES_IN_PER_SEC,
            start,
            end,
            step,
            brokerIds
          );

        if (topics) {
          allMessagesInPerSec = allMessagesInPerSec.filter((el) =>
            topics.includes(el.topic)
          );
        }

        return allMessagesInPerSec;
      } catch (error) {
        console.log(
          `An error has occured with Query messagesInPerSec: ${error}`
        );
      }
    },
  },

  Mutation: {
    addTopic: async (
      parent,
      { name, replicationFactor = -1, numPartitions = -1, configEntries }
    ) => {
      try {
        const topic = await brokerData.createTopic(
          name,
          replicationFactor,
          numPartitions,
          configEntries
        );
        return topic;
      } catch (error) {
        console.warn(
          `Mutation addTopic failed for topic: ${name}. Error: ${error}`
        );
      }
    },

    deleteTopic: async (parent, { name }) => {
      try {
        const topic = await brokerData.deleteTopic(name);
        return topic;
      } catch (error) {
        console.warn(
          `Mutation deleteTopic failed for topic: ${name}. Error: ${error}`
        );
        return error;
      }
    },

    reassignPartitions: async (
      parent,
      { topics }
    ): Promise<OngoingTopicReassignment[]> => {
      try {
        return await brokerData.reassignPartitions(topics);
      } catch (error) {
        console.warn(
          `Mutation reassignPartitions failed for topics: ${topics}. Error: ${error}`
        );
        return error;
      }
    },
  },
};

export default resolvers;
