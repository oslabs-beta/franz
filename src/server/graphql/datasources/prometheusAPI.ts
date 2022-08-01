import "dotenv/config";
import { RESTDataSource } from "apollo-datasource-rest";
/**
 * TODO: Create a way for a user to provide their Prometheus URL
 * TODO: Map prometheus instance to brokerId
 */

class PromAPI extends RESTDataSource {
  brokerMap: any;
  reverseMap: any;
  mapped: boolean;
}

class PrometheusAPI extends PromAPI {
  constructor(baseURL: string = process.env.PROMETHEUS_URL) {
    super();
    this.baseURL = baseURL;
    this.brokerMap = {};
    this.reverseMap = {};
    this.mapped = false;
  }

  async mapBrokers() {
    if (this.mapped === true) return true;
    const query = "query={brokerid!=''}";
    try {
      const result = await this.get(`api/v1/query?${query}`);

      result.data.result.forEach((broker) => {
        this.brokerMap[broker.metric.instance] = broker.metric.brokerid;
        this.reverseMap[broker.metric.brokerid] = broker.metric.instance;
      });

      this.mapped = true;
      return true;
    } catch (error) {
      console.log(`Error with mapping brokers. Error: ${error}.`);
      return false;
    }
  }

  async queryData(query, filter?) {
    let queryString = `query=${query.query}`;
    try {
      if (filter && filter.length >= 1) {
        if (query.type === "broker") filter = await this.filter(filter);
        queryString = queryString.replaceAll("filter", filter);
      } else {
        queryString = queryString.replaceAll("filter", ".*");
      }

      const result = await this.get(`api/v1/query?${queryString}`);
      const data = result.data.result;

      return await this.formatResponse(data);
    } catch (error) {
      console.log(`Error occured with ${query.name}. Error: ${error}`);
    }
  }

  async queryDataRange(query, start, end, step, filter?) {
    let queryString = `query=${query.query}`;
    const unixStart = Math.round(new Date(start).getTime() / 1000);
    const unixEnd = Math.round(new Date(end).getTime() / 1000);

    try {
      if (!unixStart || !unixEnd || isNaN(unixStart) || isNaN(unixEnd))
        throw "Date input incorrect";

      if (filter && filter.length >= 1) {
        if (query.type === "broker") filter = await this.filter(filter);
        queryString = queryString.replaceAll("filter", filter);
      } else {
        queryString = queryString.replaceAll("filter", ".*");
      }

      queryString += `&start=${unixStart}&end=${unixEnd}&step=${step}`;
      const result = await this.get(`api/v1/query_range?${queryString}`);
      const data = result.data.result;

      return await this.formatResponseSeries(data);
    } catch (error) {
      console.log(`Error occured with ${query.name}. Error: ${error}`);
    }
  }

  async getMedianTotalTimeMs(requestType, filter) {
    const query = `query=kafka_network_requestmetrics_totaltimems{request=~"${requestType}", quantile=~"0.50"${
      filter ? `,instance=~"${this.filter(filter)}"` : ""
    }}`;
    const result = await this.get(`api/v1/query?${query}`);
    const data = result.data.result;

    return this.formatResponse(data);
  }

  async getAvgTotalTimeMs(requestType, filter) {
    const query = `query=avg(kafka_network_requestmetrics_totaltimems{request=~"${requestType}", quantile=~"0.50"${
      filter ? `,instance=~"${this.filter(filter)}"` : ""
    }})by(quantile)`;
    const result = await this.get(`api/v1/query?${query}`);
    const data = result.data.result;

    return this.formatResponse(data);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async formatResponse(data: any[]) {
    if (!this.mapped) await this.mapBrokers();

    const formattedData = [];
    data.forEach((result) => {
      const obj = {
        time: new Date(result.value[0] * 1000).toString(),
        resource: result.metric.instance,
        brokerId: Number(this.brokerMap[result.metric.instance]),
        topic: result.metric.topic,
      };
      obj["metric"] = Number(result.value[1]);
      formattedData.push(obj);
    });

    return formattedData;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async formatResponseSeries(data: any[]) {
    if (!this.mapped) await this.mapBrokers();

    const formattedData = [];
    data.forEach((result) => {
      const obj = {
        resource: result.metric.instance,
        brokerId: Number(this.brokerMap[result.metric.instance]),
        values: [],
        topic: result.metric.topic,
      };
      result.values.forEach((value) => {
        const point = {
          time: new Date(value[0] * 1000).toLocaleString("en-US", {
            timeStyle: "long",
            dateStyle: "short",
            hour12: false,
          }),
        };
        point["metric"] = Number(value[1]).toFixed(2);
        obj.values.push(point);
      });
      formattedData.push(obj);
    });

    return formattedData;
  }

  async filter(brokers: number[]) {
    if (!this.mapped) await this.mapBrokers();

    let filter = "";
    brokers.forEach((broker) => (filter += `${this.reverseMap[broker]}|`));
    return filter;
  }
}

export default PrometheusAPI;
