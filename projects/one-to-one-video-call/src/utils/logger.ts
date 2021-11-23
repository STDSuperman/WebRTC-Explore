import consola from "consola";

export class Logger {
  log(message: string) {
    consola.log(message);
  }
  
  warn(message: string) {
    consola.warn(message);
  }

  error(message: string) {
    consola.error(message);
  }
}

export const logger = new Logger();