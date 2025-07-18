import {ClipLoader, BeatLoader, PulseLoader} from 'react-spinners';

type LoaderType = typeof ClipLoader | typeof BeatLoader | typeof PulseLoader;

interface LoaderProps{
    type?: LoaderType;
    size?: number;
    color?: string;
    loading?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
    type = ClipLoader,
    size = 30,
    color = '#3B82F6', 
    loading  = true,
}) => {
    const getSpinner = () => {
        switch(type){
            case ClipLoader:
                return <ClipLoader size={size} color={color} loading={loading} />;
            case BeatLoader:
                return <BeatLoader size={size} color={color} loading={loading} />;
            case PulseLoader:
                return <PulseLoader size={size} color={color} loading={loading} />;
            default:
                return <ClipLoader size={size} color={color} loading={loading} />;
        }
    }
    return (
        <div className="flex justify-center items-center h-full w-full">
            {getSpinner()}
        </div>
    );
};

export default Loader;