export default class Player {
  constructor(apiHandler, initialData) {
    this.apiHandler = apiHandler;

    this.profileId = initialData.profileId;
    this.userId = initialData.userId;
    this.platform = initialData.platformType;
    this.platformUrl = apiHandler.getPlatformUrl(this.platform);
    this.idOnPlatform = initialData.idOnPlatform;
    this.name = initialData.nameOnPlatform;
  }

  async fetchStatistics(statistics) {
    const url = `/v1/spaces/${this.apiHandler.getSpaceId(this.platform)}/sandboxes/
    ${this.platform}/playerstats2/statistics`;

    const data = await this.apiHandler.getWithAuth(url, {
      populations: this.id,
      statistics: statistics.join(','),
    });

    console.log(data);

    return new Promise((resolve, reject) => {
      if (data) {
        return resolve(data);
      }

      return reject(new Error('dumb'));
    });
  }
}
