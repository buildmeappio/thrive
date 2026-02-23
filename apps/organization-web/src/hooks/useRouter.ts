import { PrefetchKind } from 'next/dist/client/components/router-reducer/router-reducer-types';
import type {
  NavigateOptions,
  PrefetchOptions,
} from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter as useNextRouter } from 'next/navigation';

type RouterOptions = {
  params?: { [key: string]: string | number };
  query?: { [key: string]: string | number | boolean | undefined | null };
};

const buildQueryString = (query: {
  [key: string]: string | number | boolean | undefined | null;
}) => {
  const queryString = Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
  return queryString ? `?${queryString}` : '';
};

const buildPath = (path: string, params?: { [key: string]: string | number }) => {
  if (!params) return path;
  let builtPath = path;
  Object.entries(params).forEach(([key, value]) => {
    builtPath = builtPath.replace(`:${key}`, encodeURIComponent(String(value)));
  });
  return builtPath;
};

const buildUrl = (path: string, options?: RouterOptions) => {
  const builtPath = buildPath(path, options?.params);
  const queryString = options?.query ? buildQueryString(options.query) : '';
  return `${builtPath}${queryString}`;
};

const useRouter = () => {
  const router = useNextRouter();

  return {
    replace: (url: string, options?: NavigateOptions & RouterOptions) => {
      const { query, params, ...rest } = options || {};
      const path = buildUrl(url, { params, query });

      router.replace(path, rest);
    },
    push: (url: string, options?: NavigateOptions & RouterOptions) => {
      const { query, params, ...rest } = options || {};
      const path = buildUrl(url, { params, query });
      router.push(path, rest);
    },
    prefetch: (url: string, options?: PrefetchOptions & RouterOptions) => {
      const { query, params, ...rest } = options || { kind: PrefetchKind.AUTO };
      const path = buildUrl(url, { params, query });
      router.prefetch(path, rest);
    },
    refresh: () => {
      router.refresh();
    },
    back: () => {
      router.back();
    },
    forward: () => {
      router.forward();
    },
  };
};

export default useRouter;
