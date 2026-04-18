import { Input, InputProps } from '../atoms/Input';
import { Label } from '../atoms/Label';

interface FormFieldProps extends InputProps {
  label: string;
  error?: string;
}

export function FormField({ label, error, id, ...props }: FormFieldProps) {
  return (
    <div className="grid w-full items-center gap-1.5 mb-4">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} {...props} />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
