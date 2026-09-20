import { NotFoundView } from '@/components/sections/not-found-view';

/** Se muestra si algo lanza notFound() desde una página; ver también app/[locale]/(marketing)/404. */
export default function NotFound() {
  return <NotFoundView />;
}
