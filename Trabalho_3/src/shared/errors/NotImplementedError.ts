export class NotImplementedError extends Error {
  constructor(message = "This part of the application still needs to be implemented.") {
    super(message);
    this.name = "NotImplementedError";
  }
}
