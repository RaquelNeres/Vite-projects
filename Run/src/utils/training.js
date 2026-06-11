// Simple adaptive training plan generator
// Given a current weekly km and a target weekly km, generates a plan of N weeks
export function generateTrainingPlan(currentWeeklyKm = 0, targetWeeklyKm = 30, weeks = 12) {
  const plan = []
  const increasePerWeek = (targetWeeklyKm - currentWeeklyKm) / Math.max(1, weeks - 1)
  for (let i = 0; i < weeks; i++) {
    const weekKm = Math.max(0, currentWeeklyKm + increasePerWeek * i)
    // simple breakdown: 3 easy runs (40% total), 1 long run (30%), 1 quality session (30%)
    const longRun = +(weekKm * 0.3).toFixed(1)
    const quality = +(weekKm * 0.3 / 1).toFixed(1)
    const easy = +((weekKm - longRun - quality) / 3).toFixed(1)
    plan.push({
      week: i + 1,
      weekKm: +weekKm.toFixed(1),
      sessions: [
        { name: 'Easy', count: 3, eachKm: easy },
        { name: 'Long', count: 1, eachKm: longRun },
        { name: 'Quality', count: 1, eachKm: quality },
      ]
    })
  }
  return plan
}
