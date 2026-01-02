import { FileText, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { HeaderConfig, FooterConfig } from "../types";
import type { useHeaderFooter } from "../hooks/useHeaderFooter";

interface HeaderFooterButtonsProps {
	headerConfig?: HeaderConfig;
	footerConfig?: FooterConfig;
	headerFooterHandlers: ReturnType<typeof useHeaderFooter>;
}

export function HeaderFooterButtons({
	headerConfig,
	footerConfig,
	headerFooterHandlers,
}: HeaderFooterButtonsProps) {
	const {
		setShowHeaderModal,
		setShowFooterModal,
		removeHeader,
		removeFooter,
	} = headerFooterHandlers;

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-xs"
						title={headerConfig ? "Header Options" : "Add Header"}
					>
						<FileText className="h-4 w-4" />
						{headerConfig && <span className="ml-1 text-xs">Header</span>}
						<ChevronDown className="ml-1 h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => setShowHeaderModal(true)}>
						<FileText className="mr-2 h-4 w-4" />
						{headerConfig ? "Edit Header" : "Add Header"}
					</DropdownMenuItem>
					{headerConfig && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={removeHeader}
								className="text-red-600 focus:text-red-600"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Remove Header
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-xs"
						title={footerConfig ? "Footer Options" : "Add Footer"}
					>
						<FileText className="h-4 w-4 rotate-180" />
						{footerConfig && <span className="ml-1 text-xs">Footer</span>}
						<ChevronDown className="ml-1 h-3 w-3" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent>
					<DropdownMenuItem onClick={() => setShowFooterModal(true)}>
						<FileText className="mr-2 h-4 w-4 rotate-180" />
						{footerConfig ? "Edit Footer" : "Add Footer"}
					</DropdownMenuItem>
					{footerConfig && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={removeFooter}
								className="text-red-600 focus:text-red-600"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Remove Footer
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
}

