import consola from "consola";
import chalk from "chalk";

export class Logger {
  log(...message: string[]) {
    consola.log(`[LOG]：${message.join('-')}`);
  }

  warn(...message: string[]) {
    consola.warn(chalk.yellow(`[WARN]：${message.join('-')}`));
  }

  error(...message: string[]) {
    consola.error(chalk.red(`[ERROR]：${message.join('-')}`));
  }
}

export const logger = new Logger();