import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage(): JSX.Element {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage profile, notification behavior, and organization defaults."
      />
      <Card>
        <div className="mb-4 flex gap-2">
          {["Profile", "Notifications", "Appearance", "Organization"].map((tab, index) => (
            <Button key={tab} size="sm" variant={index === 0 ? "secondary" : "ghost"}>
              {tab}
            </Button>
          ))}
        </div>
        <p className="text-sm text-[hsl(var(--color-text-muted))]">
          This tab system is optimized for low-cognitive-load navigation and faster admin workflows.
        </p>
      </Card>
    </div>
  );
}
