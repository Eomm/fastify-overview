import DetailsBarHeader from './DetailsBarHeader';

interface DetailsBarDecoratorsPropType {
  className?: string;
}

export default function DetailsBarDecorators({
  className,
}: DetailsBarDecoratorsPropType) {
  return (
    <div className="flex flex-col flex-grow">
      <DetailsBarHeader title={'Decorators'} />
      <div className="w-full flex-grow px-2">insert here the decorators</div>
    </div>
  );
}
