import { format, createLogger, transports, Logger } from "winston";
import stream from "stream";
import dailyRotate from "winston-daily-rotate-file";

const { combine, cli, printf, timestamp, errors, label } = format;

let log: Map<string, Logger> = new Map();
function loggerFormat(info: any) {
  return `[At ${info.timestamp}] ${info.label} - ${info.level}: ${info.message}`;
}

function getFormat(
  isConsole: boolean,
  hasErrorHandling: boolean,
  instanceLabel?: string,
) {
  if (
    !isConsole &&
    !hasErrorHandling &&
    (instanceLabel === undefined || instanceLabel.length <= 0)
  )
    return combine(
      timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
      printf(loggerFormat),
    );

  let extra = [];

  if (isConsole) extra.push(cli());
  if (hasErrorHandling) extra.push(errors({ stack: true, cause: true }));
  if (instanceLabel !== undefined && instanceLabel.length > 0)
    extra.push(label({ label: instanceLabel }));

  return combine(
    ...extra,
    timestamp({ format: "YYYY-MM-DD hh:mm:ss A" }),
    printf(loggerFormat),
  );
}

function transportConsole(instance: string) {
  return [
    new transports.Console({
      level: process.env.NODE_ENV === "production" ? "warn" : "info,warn,alert",
      format: getFormat(true, false, instance),
    }),
    new transports.Console({
      level: "crit,error",
      format: getFormat(true, true, instance),
    }),
  ];
}

function transportFile(instance: string) {
  return [
    new transports.File({
      filename: `logs/${label}/operation.log`,
      maxFiles: 1,
      level: "info,warn,alert,debug",
      format: getFormat(false, false, instance),
    }),
    new transports.File({
      filename: `logs/${label}/error.log`,
      maxFiles: 1,
      level: "error,crit",
      format: getFormat(false, false, instance),
    }),
  ];
}

function transportRotate(instance: string) {
  return [
    new dailyRotate({
      frequency: "1h",
      datePattern: "YYYY-MM-DD",
      filename: `logs/${instance}/%DATE%_operation.log`,
      maxFiles: 12,
      createSymlink: true,
      symlinkName: `logs/${instance}/!current_operation.log`,
      level: "info,warn,alert,debug",
      format: getFormat(false, false, instance),
    }),
    new dailyRotate({
      frequency: "1h",
      datePattern: "YYYY-MM-DD",
      filename: `logs/${instance}/%DATE%_error.log`,
      maxFiles: 12,
      createSymlink: true,
      symlinkName: `logs/${instance}/!current_error.log`,
      level: "error,crit",
      format: getFormat(false, false, instance),
    }),
  ];
}

function getTransport(instance: string, simple: boolean) {
  const stdout: stream.Writable[] = [
    new transports.File({
      filename: "logs/logger-issue.log",
      handleExceptions: true,
      handleRejections: true,
      format: getFormat(false, false),
    }),
    ...transportConsole(instance),
  ];

  if (simple) {
    stdout.push(...transportFile(instance));
  } else {
    stdout.push(...transportRotate(instance));
  }

  return stdout;
}

export function getLogger(label: string, simplified: boolean = false) {
  if (log.has(label)) return log.get(label)!;

  const logger = createLogger({
    transports: getTransport(label, simplified),
    exitOnError: false,
  });

  log.set(label, logger);

  return logger;
}
