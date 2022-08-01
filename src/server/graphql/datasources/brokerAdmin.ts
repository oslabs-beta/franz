import { admin } from "../../kafka/kafka";
import {
  ConfigResourceTypes,
  PartitionReassignment,
  OngoingTopicReassignment,
  ITopicConfig,
} from "kafkajs";
import { Cluster, Broker, ConfigEntries } from "../../../../types/types";

export async function getClusterInfo(): Promise<Cluster> {
  try {
    const info = await admin.describeCluster();
    const brokers: Broker[] = [];
    for (let i = 0; i < info.brokers.length; i++) {
      brokers.push({
        brokerId: info.brokers[i].nodeId,
        brokerPort: info.brokers[i].port,
        brokerHost: info.brokers[i].host,
      });
    }

    const cluster: Cluster = {
      brokers,
      activeController: brokers.filter(
        (broker) => broker.brokerId === info.controller
      )[0],
    };

    return cluster;
  } catch (error) {
    console.log(error);
  }
}

export async function getSingleTopic(name: string) {
  try {
    const topic = await admin
      .fetchTopicMetadata({ topics: [name] })
      .then((topics) => topics.topics[0]);

    return topic;
  } catch (error) {
    console.log(`Kafka Admin Error getting single topic ${name}: ${error}`);
  }
}

export async function getAllTopics() {
  try {
    const names = await admin.listTopics();
    const topics = await admin.fetchTopicMetadata({ topics: names });

    return topics.topics;
  } catch (error) {
    console.log(`Kafka Admin Error getting single topic: ${error}`);
  }
}

export async function createTopic(
  topic: string,
  replicationFactor: number,
  numPartitions: number,
  configEntries: ConfigEntries[]
) {
  const topicConfig: ITopicConfig = {
    topic,
    replicationFactor,
    numPartitions,
  };

  if (configEntries) topicConfig.configEntries = configEntries;

  try {
    const topicCreated = await admin.createTopics({ topics: [topicConfig] });
    if (topicCreated) {
      const topics = await admin.fetchTopicMetadata({ topics: [topic] });
      return topics.topics[0];
    }
  } catch (error) {
    console.warn(`Error when creating topic: ${topic}. Error: ${error}`);
  }
}

export async function canDelete() {
  try {
    const cluster = await admin.describeCluster();
    const canDelete = await admin.describeConfigs({
      includeSynonyms: true,
      resources: [
        {
          type: ConfigResourceTypes.BROKER,
          name: cluster.brokers[0].nodeId.toString(),
          configNames: ["delete.topic.enable"],
        },
      ],
    });

    return canDelete.resources[0].configEntries[0].configValue === "true";
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function deleteTopic(topic: string) {
  try {
    if (!(await canDelete()))
      throw "Delete topic is not enabled on this cluster.";
    const topicToDelete = await getSingleTopic(topic);
    await admin.deleteTopics({ topics: [topic] });
    return topicToDelete;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export async function reassignPartitions(
  topics: PartitionReassignment[]
): Promise<OngoingTopicReassignment[]> {
  try {
    await admin.alterPartitionReassignments({ topics });
    const result = await admin.listPartitionReassignments({});

    return result.topics;
  } catch (error) {
    console.warn(`Error occured reassigning partitions: ${error}`);
    return error;
  }
}
