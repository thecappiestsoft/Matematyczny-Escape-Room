import { tx } from '../i18n';
import { evaluateAchievements } from '../engine/achievements';
import type { GameState } from '../engine/game';
import { buildReport, type GameReport } from '../engine/report';
import { classTransport } from '../net/transport';
import { repo } from '../storage/repo';
import type { Scenario } from '../types';

/** Zapis wyników po zakończeniu rozgrywki: historia, osiągnięcia, kampania, tryb klasowy */
export function finishGame(s: GameState, sc: Scenario): { report: GameReport; achievements: string[] } {
  const report = buildReport(s, sc);
  const player = s.config.playerName || tx('Gracz', 'Player');
  const history = repo.getHistory().filter((h) => h.playerName === player);
  const owned = repo.getAchievements(player);
  const fresh = evaluateAchievements(report, history, owned);
  repo.addResult(report);
  if (fresh.length) repo.addAchievements(player, fresh);
  if (s.config.mode === 'campaign' && report.status === 'won') {
    const p = repo.getCampaign(player);
    if (!p.completed.includes(sc.id)) p.completed.push(sc.id);
    p.level = s.config.level;
    repo.saveCampaign(player, p);
  }
  if (s.config.mode === 'class' && s.config.classSessionId && s.config.teamName) {
    void classTransport.submitResult(s.config.classSessionId, s.config.teamName, report);
  }
  repo.setSave(null);
  return { report, achievements: fresh };
}
