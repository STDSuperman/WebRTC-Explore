import consola from 'consola';
import chalk from 'chalk';

export class Logger {
  log(...msg: unknown[]): void{
    consola.log(`
      ${chalk.bgGray(`[LOG]: `)}${msg.join(', ')}
    `)
  }

  info(...msg: unknown[]): void{
    consola.log(`
      ${chalk.greenBright(`[INFO]: `)}${msg.join(' ')}
    `)
  }

  error(...msg: unknown[]): void{
    consola.log(`
      ${chalk.redBright(`[ERROR]: `)}${msg.join(' ')}
    `)
  }
}

export const logger = new Logger();