import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

export function ManualInputPanel({
  value,
  onChange,
  onSubmit,
  onClear,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  disabled?: boolean;
}) {
  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">Manual QR Input</h3>
            <p className="text-sm text-gray-600">Paste the complete QR code JSON data</p>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="qr-json">QR Code JSON Data</Label>
              <textarea
                id="qr-json"
                placeholder='{"sid":"example123","encrypted_data":"base64data...","raffleId":"activityId123"}'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full min-h-[120px] p-3 text-sm border border-gray-300 rounded-lg resize-vertical font-mono"
                rows={5}
              />
              <p className="text-xs text-gray-500 mt-1">
                Copy and paste the complete JSON data from the QR code
              </p>
            </div>
          </div>

          <div className="flex space-x-2 mt-6">
            <Button onClick={onSubmit} className="flex-1" disabled={disabled}>Process QR Data</Button>
            <Button onClick={onClear} variant="outline">Clear</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

