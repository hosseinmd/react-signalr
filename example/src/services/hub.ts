export enum ChatOperationsNames {
  StartWorkAsync = "StartWorkAsync",
  StopWork = "StopWork",
  StopWork2 = "StopWork2",
}

export type ChatOperations = {
  [ChatOperationsNames.StartWorkAsync]: (
    message?: StartWorkVm,
  ) => Promise<void>;
  [ChatOperationsNames.StopWork]: (message?: StopWorkVm) => Promise<void>;
  [ChatOperationsNames.StopWork2]: (message?: string) => Promise<void>;
};

export enum ChatCallbacksNames {
  hello = "hello",
  startwork = "startwork",
  stopwork = "stopwork",
}

export type ChatCallbacks = {
  [ChatCallbacksNames.hello]: () => void;
  [ChatCallbacksNames.startwork]: (message?: StartWorkVm) => void;
  [ChatCallbacksNames.stopwork]: (message?: StopWorkVm) => void;
};

export interface Chat {
  callbacksName: ChatCallbacksNames;
  callbacks: ChatCallbacks;

  methodsName: ChatOperationsNames;
  methods: ChatOperations;
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
