import { NavigateOptions, PrefetchOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter } from "next/navigation";

const PREFIX = "/admin";

const useRouter = () => {
	const router = useNextRouter();

	return {
		replace: (url: string, options?: NavigateOptions) => {
			router.replace(PREFIX + url, options);
		},
		push: (url: string, options?: NavigateOptions) => {
			router.push(PREFIX + url, options);
		},
		prefetch: (url: string, options?: PrefetchOptions) => {
			router.prefetch(PREFIX + url, options);
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