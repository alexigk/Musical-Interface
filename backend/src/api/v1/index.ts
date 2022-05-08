import * as express from 'express';
import { ResourceController } from '../shared';
import { ITask, TaskModel } from '@app/models';
import { FilesController } from './files/files.controller';
import { SocketEventsController } from './socket-events/socket-events.controller';
import { ExampleController } from './example/example.controller';
import { MusicLibController } from './music-lib/music-lib.controller';
import { PlayerController } from './player/player.controller';


const apiV1Router = express.Router();


apiV1Router
  // Sockets events routes
  .use(
    '/socket-events',
    new SocketEventsController().applyRoutes()
  )

  // Sockets events routes
  .use(
    '/files',
    new FilesController().applyRoutes()
  )

  // Task routes
  .use(
    '/tasks',
    new ResourceController<ITask>(TaskModel).applyRoutes()
  )
  // Demo
  .use(
    '/example',
    new ExampleController().applyRoutes()
  )

  .use(
    '/music-lib',
    new MusicLibController().applyRoutes()
  )
  .use(
    '/player',
    new PlayerController().applyRoutes()
  );


export { apiV1Router };
