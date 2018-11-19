export default class KatoError extends Error {
  constructor(message: string, public code: number = -1) {
    super(message);
  }
}
