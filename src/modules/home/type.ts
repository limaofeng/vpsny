export interface Container {
  id: string;
  name: string;
  cpu: string;
  mem: string;
  net: string;
}

export interface Process {
  id: string;
  user: string;
  cpu: string;
  mem: string;
  vsz: number;
  rss: number;
  tty: string;
  stat: string;
  start: string;
  time: string;
  command: string;
}

export interface InstantState {
  id?: string;
  status: 'Pending' | 'Stopping';
}
