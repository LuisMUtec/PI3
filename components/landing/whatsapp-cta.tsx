import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { whatsappUrl } from "@/lib/whatsapp/link";
import { WhatsappIcon } from "./whatsapp-icon";

export function WhatsappCta({
  label = "Abrir WhatsApp",
  className,
  iconClassName = "size-5",
}: {
  label?: string;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <Button
      variant="whatsapp"
      nativeButton={false}
      className={cn(
        "h-12 gap-2 rounded-xl px-6 text-base font-semibold",
        className,
      )}
      render={
        <a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
        />
      }
    >
      <WhatsappIcon className={iconClassName} />
      {label}
    </Button>
  );
}
