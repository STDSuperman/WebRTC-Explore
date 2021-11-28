import consola from "consola";
import chalk from "chalk";

export class Logger {
  log(...message: unknown[]): void {
    consola.log(`[LOG]：${message.join('-')}`);
  }

  warn(...message: unknown[]): void {
    consola.warn(chalk.yellow(`[WARN]：${message.join('-')}`));
  }

  error(...message: unknown[]): void {
    consola.error(chalk.red(`[ERROR]：${message.join('-')}`));
  }
}

export const logger = new Logger();