import DetailsBarHeader from './DetailsBarHeader';

interface DetailsBarHooksPropType {
  className?: string;
}

export default function DetailsBarHooks({ className }: DetailsBarHooksPropType) {
  return (
    <div className="flex flex-col flex-grow">
      <DetailsBarHeader title={'Hooks'} />
      <div className="w-full flex-grow px-2">
        <div className="flex items-center">
          <div className="w-24 font-semibold text-gray-600 font-semibold text-lg">
            /route
          </div>
          <select className="w-full block shadow-sm border-gray-300 rounded-md focus:outline-none focus:ring focus:border-gray-300">
            <option>/authentication/login</option>
            <option>/authentication/success</option>
          </select>
        </div>
      </div>
    </div>
  );
}
