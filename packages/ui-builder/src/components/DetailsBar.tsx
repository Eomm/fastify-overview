import DetailsBarDecorators from './DetailsBarDecorators';
import DetailsBarHooks from './DetailsBarHooks';
import IconPlugin from './IconPlugin';

interface DetailsBarPropType {
  className: string;
}

export default function DetailsBar({ className }: DetailsBarPropType) {
  return (
    <aside className={className + ' flex flex-col'}>
      <h1 className="text-xl p-2 text-gray-900 font-bold flex items-center">
        <IconPlugin className={'w-4 h-4 text-gray-900 mr-2'} />
        fastify-auth0-verify
      </h1>
      <DetailsBarDecorators className={'flex-grow'} />
      <DetailsBarHooks className={'flex-grow'} />
    </aside>
  );
}
