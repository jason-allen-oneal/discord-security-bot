// src/commands/index.ts

import * as ping from './ping';
import * as recon from './recon';
import * as security from './security';
import * as tools from './tools';
import * as ai from './ai';
import * as threat from './threat';
import * as compliance from './compliance';

export const commands = {
  ping,
  ai,
  recon,
  security,
  tools,
  threat,
  compliance
};
