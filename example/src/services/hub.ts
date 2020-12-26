export enum ChatHubServiceOperationsNames {
  StartWorkAsync = "StartWorkAsync",
  StopWork = "StopWork",
}

export interface ChatHubServiceOperations {
  [ChatHubServiceOperationsNames.StartWorkAsync]: (
    message?: StartWorkVm,
  ) => Promise<void>;
  [ChatHubServiceOperationsNames.StopWork]: (
    message?: StopWorkVm,
  ) => Promise<void>;
}

export enum ChatHubServiceCallbacksNames {
  hello = "hello",
  startwork = "startwork",
  stopwork = "stopwork",
}

export interface ChatHubServiceCallbacks {
  [ChatHubServiceCallbacksNames.hello]: () => void;
  [ChatHubServiceCallbacksNames.startwork]: (message?: StartWorkVm) => void;
  [ChatHubServiceCallbacksNames.stopwork]: (message?: StopWorkVm) => void;
}

export enum JobType {
  Programer = "Programer",
  Manager = "Manager",
}

export interface StartWorkVm {
  /** MaxLength: 100 */
  firstName: string;
  jobType: JobType;
  /** MaxLength: 200 */
  lastName: string;
  /** Format: date-time */
  birthDate?: string;
}

export interface StopWorkVm {
  /** Format: date-time */
  date?: string;
  description?: string;
}
