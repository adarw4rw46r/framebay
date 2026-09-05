export type CinemaPromptInput = {
  project: { title?: string; genre?: string | null; era?: string | null; tempo?: string | null; briefTone?: string | null; briefDos?: string | null; briefDonts?: string | null; aspectRatio?: string };
  scene?: { title?: string; index?: number } | null;
  shot: { title?: string; actionLine?: string | null; dialogue?: string | null; cameraBody?: string | null; lens?: string | null; move?: string | null; durationSec?: number; prompt?: string; locationId?: string | null; characterIds?: string };
  cast?: Array<{ id: string; kind: string; name: string; notes?: string | null }>;
};

function clean(value: unknown) { return typeof value === "string" ? value.trim() : ""; }
function selectedNames(ids: string | undefined, cast: CinemaPromptInput["cast"]) {
  try {
    const parsed = JSON.parse(ids || "[]") as string[];
    return (cast ?? []).filter((item) => parsed.includes(item.id)).map((item) => item.name);
  } catch { return []; }
}

export function assembleCinemaPrompt(input: CinemaPromptInput) {
  const { project, scene, shot, cast = [] } = input;
  const characters = selectedNames(shot.characterIds, cast);
  const location = cast.find((item) => item.id === shot.locationId)?.name;
  const parts = [
    `Cinematic film frame from ${clean(project.title) || "an original film"}`,
    scene?.title ? `Scene ${scene.index ?? ""}: ${scene.title}` : "",
    project.genre ? `${project.genre} genre` : "",
    project.era ? `${project.era} era` : "",
    project.aspectRatio ? `${project.aspectRatio} aspect ratio` : "",
    project.tempo ? `${project.tempo} pacing` : "",
    project.briefTone ? `tone: ${project.briefTone}` : "",
    characters.length ? `cast: ${characters.join(", ")}` : "",
    location ? `location: ${location}` : "",
    clean(shot.actionLine) || clean(shot.prompt),
    shot.dialogue ? `Dialogue: “${clean(shot.dialogue)}”` : "",
    shot.cameraBody ? `Camera: ${shot.cameraBody}` : "",
    shot.lens ? `Lens: ${shot.lens}` : "",
    shot.move ? `Movement: ${shot.move}` : "",
    shot.durationSec ? `${shot.durationSec} second shot` : "",
    project.briefDos ? `Do: ${project.briefDos}` : "",
    project.briefDonts ? `Avoid: ${project.briefDonts}` : "",
  ];
  return parts.filter(Boolean).join(". ").replace(/\.\./g, ".") + ".";
}
