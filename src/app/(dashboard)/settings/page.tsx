import { getSettings } from "@/actions/settings";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  let settings = null;
  try {
    settings = await getSettings();
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Танзимот</h1>
        <p className="text-sm text-slate-500">Маълумоти мағоза ва система</p>
      </div>
      {settings ? (
        <SettingsForm settings={settings} />
      ) : (
        <p className="text-slate-500">Маълумот бор нашуд</p>
      )}
    </div>
  );
}
