export default class Player {
  constructor(apiHandler, initialData) {
    this.apiHandler = apiHandler;

    this.id = initialData.profileId;
    this.userId = initialData.userId;
    this.platform = initialData.platformType;
    this.platformUrl = apiHandler.getPlatformUrl(this.platform);
    this.idOnPlatform = initialData.idOnPlatform;
    this.name = initialData.nameOnPlatform;
  }

  async fetchStatistics(statistics) {
    console.log('got here');
    const url = `/v1/spaces/${this.apiHandler.getSpaceId(this.platform)}/sandboxes/${this.apiHandler.getPlatformUrl(this.platform)}/playerstats2/statistics`;

    const data = await this.apiHandler.getWithAuth(url, {
      populations: this.id,
      statistics: Array.isArray(statistics) ? statistics.join(',') : statistics,
    });

    return new Promise((resolve, reject) => {
      if (data) {
        console.log(data);
        return resolve(data);
      }

      return reject(new Error('dumb'));
    });
  }
}
