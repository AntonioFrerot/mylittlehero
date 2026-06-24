import { CREER_FILM_WITH_FREE_TRIAL_INTENT } from "@/lib/film-creation/free-trial-intent";
import { redirect } from "next/navigation";

export default function EssaiGratuitPage() {
  redirect(CREER_FILM_WITH_FREE_TRIAL_INTENT);
}
