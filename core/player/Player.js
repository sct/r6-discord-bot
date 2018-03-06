export default class Player {
  constructor(apiHandler, initialData) {
    this.apiHandler = apiHandler;

    this.data = {
      ...initialData
    };
  }
}
