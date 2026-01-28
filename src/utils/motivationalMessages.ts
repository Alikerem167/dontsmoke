const motivationalMessages = [
  "Cravings rise and fall. Give it 90 seconds.",
  "Urge is a wave. Surf it, don’t fight it.",
  "Drink water. Walk 2 minutes. Come back.",
  "You’re not ‘needing’ it — your brain is negotiating.",
  "Delay 5 minutes. If you still want it, delay again.",
  "One cigarette restarts the loop. Don’t open it.",
  "Breathe in 4, hold 4, out 6. Repeat x5.",
  "Think of your best streak. Beat it.",
  "Every craving resisted is a win.",
  "You're stronger than this moment.",
  "Your lungs are healing. Don't set them back.",
  "Cravings peak and fade. This will pass.",
  "Call a friend instead of reaching for one.",
  "Put your phone down and do 20 push-ups.",
  "You've made it this far. Keep going.",
  "Imagine your future self thanking you now.",
  "The first 3 minutes are the hardest.",
  "Your body is already healing. Don't pause it.",
  "Cravings aren't facts. They're just feelings.",
  "You chose freedom. Honor that choice.",
  "Write down why you quit. Read it now.",
  "This craving is just a test. You'll pass.",
  "Every minute you don't smoke is money saved.",
  "Your smell, your taste—getting better each day.",
  "This moment matters. You're building a new you.",
  "Nicotine lies. You don't need it to feel calm.",
  "One small decision repeated is massive change.",
  "Your family is proud. Make them prouder.",
  "The urge is temporary. You are permanent.",
  "Chew gum. It works better than you think.",
  "You're rewriting your brain's reward system.",
  "This is the hard part. Hard means progress.",
  "Smell a lemon. Taste gum. Break the pattern.",
  "You've quit before for a few days, now go longer.",
  "Your blood pressure is dropping right now.",
  "Craving ≠ Need. You're confusing signals.",
  "Go outside. Get air. It's cheaper and better.",
  "You're saving $5+ per day. That's a trip soon.",
  "Your confidence is built on moments like these.",
  "One cigarette and you restart the counter. Worth it?",
  "Sleep better. Run faster. Think clearer. Keep going.",
  "Tell yourself: I'm someone who doesn't smoke.",
  "Triggers fade if you don't feed them.",
  "You're not weak for feeling the craving. You're strong for resisting.",
  "This is discomfort, not danger. Sit with it.",
  "Your future self is living a healthier life because of now.",
];

export const getRandomMessage = (exclude: string[] = []): string => {
  const filteredMessages = motivationalMessages.filter(
    (msg) => !exclude.includes(msg)
  );
  const randomIndex = Math.floor(Math.random() * filteredMessages.length);
  return filteredMessages[randomIndex];
};

export default motivationalMessages;