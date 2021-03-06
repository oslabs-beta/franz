import request from "supertest";
import appServer from "../src/server/server";
import crypto from "node:crypto";
import { admin } from "../src/server/kafka/kafka";

const server = "http://localhost:3000";

beforeAll(async () => {
  global.testServer = await appServer;
  global.admin = await admin;
});

afterAll(async () => {
  await global.admin.disconnect();
  await global.testServer.stop();
});

describe("REST Server", () => {
  describe("404s for non-existant routes", () => {
    it("Bad POST Request", () => {
      return request(server).post("/badRoute").expect(404);
    });

    it("Bad PUT Request", () => {
      return request(server).put("/badRoute").expect(404);
    });

    it("Bad DELETE Request", () => {
      return request(server).delete("/badRoute").expect(404);
    });
  });
});

describe("GraphQL Queries", () => {
  describe("Cluster Queries", () => {
    it("A query for the cluster type can return the active controller count which is an object with a time field and number.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            activeControllerCount {
              count: metric
              time
            }
          }
        }`,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.cluster).toHaveProperty("activeControllerCount");
      expect(result.data.cluster.activeControllerCount).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          time: expect.any(String),
        })
      );
    });

    it("A query for the cluster type can return the list of brokers in the cluster.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            brokers {
              brokerHost
              brokerId
              brokerPort
              cpuUsage {
                cpuUsage: metric
                time
              }
              numberUnderReplicatedPartitions {
                  underReplicatedPartitions: metric
                  time
                }
            }
          }
        }`,
      });

      expect(Array.isArray(result.data.cluster.brokers)).toBeTruthy();
      expect(result.data.cluster.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            cpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });

    it("A query for the cluster type can return information about which broker is the active controller.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            brokers {
            brokerHost
            brokerId
            brokerPort
            cpuUsage {
              cpuUsage:metric
              time
            }
            numberUnderReplicatedPartitions {
                underReplicatedPartitions: metric
                time
              }
            }
          }
        }`,
      });

      expect(Array.isArray(result.data.cluster.brokers)).toBeTruthy();
      expect(result.data.cluster.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            cpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });

    it("A query for the cluster type can return the offline partition count which is an object with a time field and number.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            offlinePartitionCount {
                count: metric
                time
              }
            }
          }`,
      });

      expect(result.errors).toBeUndefined();
      expect(result.data.cluster).toHaveProperty("offlinePartitionCount");
      expect(result.data.cluster.offlinePartitionCount).toEqual(
        expect.objectContaining({
          count: expect.any(Number),
          time: expect.any(String),
        })
      );
    });

    it("The cluster type can be queried to return a boolean if a topic can be delete.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Cluster {
          cluster {
            deleteTopic
            }
          }`,
      });

      expect(result.errors).toBeUndefined();
      expect(typeof result.data.cluster.deleteTopic).toBe("boolean");
    });
  });

  describe("Broker Queries", () => {
    it("A query for a valid broker will have fields: brokerId: Int!, brokerPort: Int!, brokerHost: String!, brokerCpuUsage: BrokerCpuUsage, numberUnderReplicatedPartitions.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Broker($brokerId: Int!) {
          broker(brokerId: $brokerId) {
              cpuUsage {
                cpuUsage: metric
                time
              }
              numberUnderReplicatedPartitions {
                underReplicatedPartitions: metric
                time
              }
              brokerHost
              brokerPort
              brokerId
            }
          }`,
        variables: { brokerId: 1 },
      });

      expect(result.errors).toBeUndefined();
      expect(typeof result.data.broker.brokerId).toBe("number");
      expect(typeof result.data.broker.brokerHost).toBe("string");
      expect(typeof result.data.broker.brokerPort).toBe("number");
      expect(typeof result.data.broker.cpuUsage.cpuUsage).toBe("number");
      expect(typeof result.data.broker.cpuUsage.time).toBe("string");
      expect(
        typeof result.data.broker.numberUnderReplicatedPartitions
          .underReplicatedPartitions
      ).toBe("number");
      expect(
        typeof result.data.broker.numberUnderReplicatedPartitions.time
      ).toBe("string");
    });

    it("A query for brokers will be an array of brokers", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Brokers {
          brokers {
            brokerHost
            brokerId
            brokerPort
            cpuUsage {
              cpuUsage:metric
              time
            }
            numberUnderReplicatedPartitions {
                underReplicatedPartitions: metric
                time
              }
          }
        }`,
      });

      expect(Array.isArray(result.data.brokers)).toBeTruthy();
      expect(result.data.brokers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            brokerId: expect.any(Number),
            brokerPort: expect.any(Number),
            brokerHost: expect.any(String),
            cpuUsage: expect.objectContaining({
              cpuUsage: expect.any(Number),
              time: expect.any(String),
            }),
            numberUnderReplicatedPartitions: expect.objectContaining({
              underReplicatedPartitions: expect.any(Number),
              time: expect.any(String),
            }),
          }),
        ])
      );
    });

    it("A query for broker can return a field disk usage which is an object with a time field and number.", async () => {
      const result = await global.testServer.executeOperation({
        query: `query Broker($brokerId: Int!) {
          broker(brokerId: $brokerId) {
              JVMMemoryUsage {
                JVMMemoryUsage: metric
                time
              }
            }
          }`,
        variables: {
          brokerId: 1,
        },
      });
      expect(result.errors).toBeUndefined();
      expect(result.data.broker).toHaveProperty("JVMMemoryUsage");
      expect(result.data.broker.JVMMemoryUsage).toEqual(
        expect.objectContaining({
          JVMMemoryUsage: expect.any(Number),
          time: expect.any(String),
        })
      );
    });
  });
});

describe("GraphQL Mutations", () => {
  describe("Delete Topic", () => {
    let topicName;
    beforeEach(async () => {
      topicName = `test-topic-${crypto.randomUUID()}`;
      await global.testServer.executeOperation({
        query: `mutation AddTopic($name: String!) {
        addTopic(name: $name) {
          name
            }
          }`,
        variables: {
          name: topicName,
        },
      });
    });

    it("The delete topic mutation returns the topic that was deleted.", async () => {
      const result = await global.testServer.executeOperation({
        query: `mutation DeleteTopic($name: String!) {
          deleteTopic(name: $name) {
            name
          }
        }`,
        variables: { name: topicName },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        deleteTopic: {
          name: topicName,
        },
      });
    });

    it("Deleting a topic removes it from the cluster and it can no longer be found in the cluster.", async () => {
      await global.testServer.executeOperation({
        query: `mutation DeleteTopic($name: String!) {
          deleteTopic(name: $name) {
            name
          }
        }`,
        variables: { name: topicName },
      });

      jest.spyOn(console, "warn").mockImplementation(() => {
        return;
      });
      jest.spyOn(console, "log").mockImplementation(() => {
        return;
      });
      const response = await global.testServer.executeOperation({
        query: `query topic($name: String!) {
          topic(name: $name) {
            name
          }
        }`,

        variables: { name: topicName },
      });

      expect(response.errors).toBeUndefined();
      expect(response.data.topic).toBeNull();
    });
  });

  describe("Add Topic", () => {
    let topicName;
    afterEach(async () => {
      await global.testServer.executeOperation({
        query: `mutation DeleteTopic($name: String!) {
        deleteTopic(name: $name) {
          name
            }
          }`,
        variables: {
          name: topicName,
        },
      });
    });

    it("The add topic mutation returns the topic that was created.", async () => {
      topicName = `test-topic-${crypto.randomUUID()}`;
      const result = await global.testServer.executeOperation({
        query: `mutation AddTopic($name: String!) {
          addTopic(name: $name) {
            name
          }
        }`,
        variables: { name: topicName },
      });

      expect(result.errors).toBeUndefined();
      expect(result.data).toEqual({
        addTopic: {
          name: topicName,
        },
      });
    });

    it("Adding a topic allows for the topic to be found in the cluster.", async () => {
      topicName = `test-topic-${crypto.randomUUID()}`;
      const result = await global.testServer.executeOperation({
        query: `mutation AddTopic($name: String!, $replicationFactor: Int, $numPartitions: Int, $configEntries: [ConfigEntry]) {
          addTopic(name: $name, replicationFactor: $replicationFactor, numPartitions: $numPartitions, configEntries: $configEntries) {
            name
            numPartitions
          }
        }`,
        variables: { name: topicName },
      });

      const response = await global.testServer.executeOperation({
        query: `query topic($name: String!) {
          topic(name: $name) {
            name
          }
        }`,

        variables: {
          name: topicName,
        },
      });

      expect(result.errors).toBeUndefined();
      expect(response.data.topic.name).toBe(result.data.addTopic.name);
    });
  });

  describe("Reassign Partitions", () => {
    let topicName;
    beforeAll(async () => {
      topicName = `test-topic-${crypto.randomUUID()}`;
      return await global.admin.createTopics({
        topics: [
          {
            topic: topicName,
            replicaAssignment: [{ partition: 0, replicas: [1, 0] }],
          },
        ],
      });
    });

    afterAll(async () => {
      jest.setTimeout(10000);
      return await global.admin.deleteTopics({
        topics: [topicName],
      });
    });

    it("Returns ongoing partition reassignment", async () => {
      const result = await global.testServer.executeOperation({
        query: `mutation ReassignPartitions($topics: [PartitionReassignment]) {
        reassignPartitions(topics: $topics) {
          name
          partitions {
            partition
            replicas
            addingReplicas
            removingReplicas
          }
        }
      }`,
        variables: {
          topics: [
            {
              topic: topicName,
              partitionAssignment: [
                {
                  partition: 0,
                  replicas: [3, 4],
                },
              ],
            },
          ],
        },
      });

      expect(result.errors).toBeUndefined();
      expect(
        result.data.reassignPartitions.filter(
          (topic) => topic.name === topicName
        )
      ).toEqual([
        {
          name: topicName,
          partitions: [
            {
              partition: 0,
              replicas: [3, 4, 1, 0],
              addingReplicas: [3, 4],
              removingReplicas: [1, 0],
            },
          ],
        },
      ]);
    });
  });
});
