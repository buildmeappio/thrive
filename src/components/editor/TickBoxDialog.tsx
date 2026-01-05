import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TickBoxDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tickBoxLabels: string;
  setTickBoxLabels: (labels: string) => void;
  onApply: () => void;
}

export function TickBoxDialog({
  open,
  onOpenChange,
  tickBoxLabels,
  setTickBoxLabels,
  onApply,
}: TickBoxDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Add Tick Box(es)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tick Box Labels (one per line)
            </label>
            <Textarea
              placeholder="Occupational Therapist&#10;Physiotherapist&#10;Chiropractor&#10;Physician"
              value={tickBoxLabels}
              onChange={(e) => setTickBoxLabels(e.target.value)}
              rows={6}
              className="font-sans"
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Enter one label per line. Multiple tick boxes will be grouped
              together and only one can be selected at a time.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={onApply}>
              Insert
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
