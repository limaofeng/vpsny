export const ERROR_CODES = {
  AGENT_ERROR: 'AGENT_ERROR'
};

export default class NetworkError extends Error {
  code: string;
  domain: string;
  timestamp = new Date();
  constructor(code: string, message: string, domain: string) {
    super(message);
    this.code = code;
    this.domain = domain;
  }
}
