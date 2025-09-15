import { createRoute } from '@/constants/routes';
import NextImage, { type ImageProps as NextImageProps } from 'next/image';

type ImageProps = NextImageProps;

const Image = ({ src: srcProp, alt, ...props }: ImageProps) => {
  let src: ImageProps['src'] = srcProp;

  if (typeof srcProp === 'string' && srcProp.startsWith('/')) {
    src = createRoute(srcProp);
  }

  return <NextImage src={src} alt={alt} {...props} />;
};

export default Image;
