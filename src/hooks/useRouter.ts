import { NavigateOptions, PrefetchOptions } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter as useNextRouter } from "next/navigation";
import { createRoute } from "@/constants/route";

const useRouter = () => {
	const router = useNextRouter();

	return {
		replace: (url: string, options?: NavigateOptions) => {
			router.replace(createRoute(url), options);
		},
		push: (url: string, options?: NavigateOptions) => {
			router.push(createRoute(url), options);
		},
		prefetch: (url: string, options?: PrefetchOptions) => {
			router.prefetch(createRoute(url), options);
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