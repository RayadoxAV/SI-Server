import Logger, { LogType } from "./logger";
import { promisify } from 'util';
import fs from 'fs';
import CustomServer from "../server/server";
import bcrypt from 'bcrypt';

const readFile = promisify(fs.readFile);

export async function commandManager(input: string) {

  const variables = {
    'version': process.env.npm_package_version,
    'status': 'Running',
    'users': `\n\tQuantity: ${CustomServer.instance.getUsers().length}\n\tData: ${JSON.stringify(CustomServer.instance.getUsers())}`,
    'students': `\n\tQuantity: ${CustomServer.instance.getStudents().length}\n\tData: ${JSON.stringify(CustomServer.instance.getStudents())}`,
    'documents': `\n\tQuantity: ${CustomServer.instance.getDocuments().length}\n\tData: ${JSON.stringify(CustomServer.instance.getDocuments())}`,
    'controls': `\n\tQuantity: ${CustomServer.instance.getControls().length}\n\tData: ${JSON.stringify(CustomServer.instance.getControls())}`,
  };

  const command = input.split(' ')[0];
    
  switch (command) {

    case 'clear' : {
      console.clear();
      break;
    }

    case 'cls': {
      console.clear();
      break;
    }

    case 'info': {
      console.clear();
      const fileFormat = await readFile('./src/information_format.info', { encoding: 'utf-8' })
      const replaceables = fileFormat.match(/\{[a-z]*[A-Z]*\}/g) || [];

      let file = fileFormat;

      for (let i = 0; i < replaceables.length; i++) {
        //@ts-ignore
        const value = variables[replaceables[i].replace(/\{|\}/g, '')];
        file = file.replace(replaceables[i], value);
      }

      console.log(file);
      
      break;      
    }

    case 'hash': {
      // TODO: REMOVE
      console.clear()
      const string = input.split(' ')[1];
      if (string) {
        console.log(bcrypt.hashSync(string, 10));
      } else {
        Logger.log('Not enough arguments', LogType.INFO);
      }
      break;
    }

    default: {
      Logger.log(`Unknown command: ${command}`, LogType.INFO)
      break;
    }
  }
}