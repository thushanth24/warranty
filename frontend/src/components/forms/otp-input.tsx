import { useRef, useEffect, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";

interface OtpInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  length?: number;
}

export default function OtpInput({ value, onChange, length = 6 }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length);
  }, [length]);

  const handleChange = (index: number, val: string) => {
    if (val.length > 1) return;
    
    const newValue = [...value];
    newValue[index] = val;
    onChange(newValue);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, length);
    const newValue = pastedData.split("").slice(0, length);
    while (newValue.length < length) {
      newValue.push("");
    }
    onChange(newValue);
    
    // Focus the next empty input or the last one
    const nextEmpty = newValue.findIndex(val => !val);
    const focusIndex = nextEmpty === -1 ? length - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="flex space-x-3 justify-center">
      {Array.from({ length }, (_, index) => (
        <Input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          maxLength={1}
          value={value[index] || ""}
          onChange={e => handleChange(index, e.target.value)}
          onKeyDown={e => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center text-xl font-semibold"
        />
      ))}
    </div>
  );
}
