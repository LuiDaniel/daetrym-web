/**
 * Mensajes de este idioma: un fichero JSON por área (cada uno aporta uno o más espacios de nombres de
 * primer nivel). Se fusionan aquí para conservar el tipado estricto de next-intl.
 * Al añadir un fichero, importarlo y esparcirlo abajo (y hacerlo igual en el otro idioma).
 */
import about from './about.json';
import blog from './blog.json';
import common from './common.json';
import cybersecurity from './cybersecurity.json';
import errors from './errors.json';
import home from './home.json';
import legal from './legal.json';
import process from './process.json';
import projects from './projects.json';
import security from './security.json';
import services from './services.json';

const messages = {
  ...common,
  ...home,
  ...services,
  ...cybersecurity,
  ...about,
  ...process,
  ...projects,
  ...blog,
  ...legal,
  ...security,
  ...errors,
};

export default messages;
