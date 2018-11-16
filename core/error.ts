export default class KatoError extends Error {
  constructor(message: string, public code: number = 10000) {
    super(message);
  }
}
